import React, { useContext, useEffect, useMemo, useState } from 'react';

import { TokenInfo, TokenListProvider } from '@solana/spl-token-registry';
import {
  Account,
  BlockhashAndFeeCalculator,
  Commitment,
  Connection,
  SignatureStatus,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
} from '@solana/web3.js';

import { cache } from 'app/contexts/accounts';
import { SendTransactionError, SignTransactionError } from 'utils/errors';
import { setProgramIds } from 'utils/ids';
import { notify } from 'utils/notifications';
import { sleep, useLocalStorageState } from 'utils/utils';

import { ExplorerLink } from '../../../components/common/ExplorerLink';
import { ENDPOINTS } from './constants';

export type ENV = 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';

const DEFAULT = ENDPOINTS[0].endpoint;
const DEFAULT_SLIPPAGE = 0.25;
const DEFAULT_TIMEOUT = 15000;

interface ConnectionConfig {
  connection: Connection;
  // sendConnection: Connection;
  endpoint: string;
  slippage: number;
  setSlippage: (val: number) => void;
  env: ENV;
  setEndpoint: (val: string) => void;
  tokens: TokenInfo[];
  tokenMap: Map<string, TokenInfo>;
}

const ConnectionContext = React.createContext<ConnectionConfig>({
  endpoint: DEFAULT,
  setEndpoint: () => {},
  slippage: DEFAULT_SLIPPAGE,
  setSlippage: (val: number) => {},
  connection: new Connection(DEFAULT, 'recent'),
  // sendConnection: new Connection(DEFAULT, 'recent'),
  env: ENDPOINTS[0].name,
  tokens: [],
  tokenMap: new Map<string, TokenInfo>(),
});

export function ConnectionProvider({ children = undefined as any }) {
  const [endpoint, setEndpoint] = useLocalStorageState('connectionEndpoint', ENDPOINTS[0].endpoint);

  const [slippage, setSlippage] = useLocalStorageState('slippage', DEFAULT_SLIPPAGE.toString());

  const connection = useMemo(() => new Connection(endpoint, 'recent'), [endpoint]);
  // const sendConnection = useMemo(() => new Connection(endpoint, 'recent'), [endpoint]);

  const chain = ENDPOINTS.find((end) => end.endpoint === endpoint) || ENDPOINTS[0];
  const env = chain.name;

  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());

  useEffect(() => {
    cache.clear();
    // fetch token files
    (async () => {
      const container = await new TokenListProvider().resolve();
      const tokens = container.filterByChainId(chain.chainId).excludeByTag('nft').getList();
      const tokenMap = tokens.reduce((map, item) => {
        map.set(item.address, item);
        return map;
      }, new Map<string, TokenInfo>());

      setTokenMap(tokenMap);
      setTokens(tokens);

      // const accounts = await getMultipleAccounts(connection, [...knownMints.keys()], 'single');
      // accounts.keys.forEach((key, index) => {
      //   const account = accounts.array[index];
      //   if (!account) {
      //     return;
      //   }
      //
      //   cache.add(new PublicKey(key), account, MintParser);
      // });
    })();
  }, [connection, env]);

  setProgramIds(env);

  // The websocket library solana/web3.js uses closes its websocket connection when the subscription list
  // is empty after opening its first time, preventing subsequent subscriptions from receiving responses.
  // This is a hack to prevent the list from every getting empty
  useEffect(() => {
    const id = connection.onAccountChange(new Account().publicKey, () => {});
    return () => {
      connection.removeAccountChangeListener(id);
    };
  }, [connection]);

  useEffect(() => {
    const id = connection.onSlotChange(() => null);
    return () => {
      connection.removeSlotChangeListener(id);
    };
  }, [connection]);

  // useEffect(() => {
  //   const id = sendConnection.onAccountChange(new Account().publicKey, () => {});
  //   return () => {
  //     sendConnection.removeAccountChangeListener(id);
  //   };
  // }, [sendConnection]);
  //
  // useEffect(() => {
  //   const id = sendConnection.onSlotChange(() => null);
  //   return () => {
  //     sendConnection.removeSlotChangeListener(id);
  //   };
  // }, [sendConnection]);

  return (
    <ConnectionContext.Provider
      value={{
        endpoint,
        setEndpoint,
        slippage: parseFloat(slippage),
        setSlippage: (val) => setSlippage(val.toString()),
        connection,
        // sendConnection,
        tokens,
        tokenMap,
        env,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  return useContext(ConnectionContext).connection as Connection;
}

// export function useSendConnection() {
//   return useContext(ConnectionContext)?.sendConnection;
// }

export function useConnectionConfig() {
  const context = useContext(ConnectionContext);
  return {
    endpoint: context.endpoint,
    setEndpoint: context.setEndpoint,
    env: context.env,
    tokens: context.tokens,
    tokenMap: context.tokenMap,
  };
}

export function useSlippageConfig() {
  const { slippage, setSlippage } = useContext(ConnectionContext);
  return { slippage, setSlippage };
}

const getErrorForTransaction = async (connection: Connection, txid: string) => {
  // wait for all confirmation before geting transaction
  await connection.confirmTransaction(txid, 'max');

  const tx = await connection.getParsedConfirmedTransaction(txid, 'confirmed');

  const errors: string[] = [];
  if (tx?.meta && tx.meta.logMessages) {
    tx.meta.logMessages.forEach((log) => {
      const regex = /Error: (.*)/gm;
      let m;
      while ((m = regex.exec(log)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        if (m.length > 1) {
          errors.push(m[1]);
        }
      }
    });
  }

  return errors;
};

export const sendTransaction = async (
  connection: Connection,
  wallet: any,
  instructions: TransactionInstruction[],
  signers: Account[],
  awaitConfirmation = true,
  commitment: Commitment = 'singleGossip',
  includesFeePayer = false,
  block?: BlockhashAndFeeCalculator
) => {
  let transaction = new Transaction();
  instructions.forEach((instruction) => transaction.add(instruction));
  transaction.recentBlockhash = (block || (await connection.getRecentBlockhash(commitment))).blockhash;

  if (includesFeePayer) {
    transaction.setSigners(...signers.map((s) => s.publicKey));
  } else {
    transaction.setSigners(
      // fee payed by the wallet owner
      wallet.publicKey,
      ...signers.map((s) => s.publicKey)
    );
  }

  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }

  if (!includesFeePayer) {
    try {
      transaction = await wallet.signTransaction(transaction);
    } catch (error) {
      throw new SignTransactionError(error);
    }
  }

  const rawTransaction = transaction.serialize();
  const options = {
    skipPreflight: true,
    commitment,
  };

  const txid = await connection.sendRawTransaction(rawTransaction, options);
  let slot = 0;

  if (awaitConfirmation) {
    const confirmationStatus = await awaitTransactionSignatureConfirmation(
      txid,
      DEFAULT_TIMEOUT,
      connection,
      commitment
    );

    slot = confirmationStatus?.slot || 0;

    if (confirmationStatus?.err) {
      const errors: string[] = [];
      try {
        // TODO: This call always throws errors and delays error feedback
        //       It needs to be investigated but for now I'm commenting it out
        // errors = await getErrorForTransaction(connection, txid);
      } catch (error) {
        console.error('getErrorForTransaction() error', error);
      }

      notify({
        message: 'Transaction failed...',
        description: (
          <>
            {errors.map((err) => (
              <div key={err}>{err}</div>
            ))}
            <ExplorerLink address={txid} type="transaction" short connection={connection} />
          </>
        ),
        type: 'error',
      });

      throw new SendTransactionError(
        `Transaction ${txid} failed (${JSON.stringify(confirmationStatus)})`,
        txid,
        confirmationStatus.err
      );
    }
  }

  return { txid, slot };
};

async function awaitTransactionSignatureConfirmation(
  txid: TransactionSignature,
  timeout: number,
  connection: Connection,
  commitment: Commitment = 'recent',
  queryStatus = false
) {
  let done = false;
  let status: SignatureStatus | null = {
    slot: 0,
    confirmations: 0,
    err: null,
  };
  let subId = 0;
  await new Promise((resolve, reject) => {
    (async () => {
      setTimeout(() => {
        if (done) {
          return;
        }
        done = true;
        reject({ timeout: true });
      }, timeout);
      try {
        subId = connection.onSignature(
          txid,
          (result, context) => {
            done = true;
            status = {
              err: result.err,
              slot: context.slot,
              confirmations: 0,
            };
            if (result.err) {
              console.log('Rejected via websocket', result.err);
              reject(result.err);
            } else {
              console.log('Resolved via websocket', result);
              resolve(result);
            }
          },
          commitment
        );
      } catch (e) {
        done = true;
        console.error('WS error in setup', txid, e);
      }
      while (!done && queryStatus) {
        try {
          const signatureStatuses = await connection.getSignatureStatuses([txid]);
          status = signatureStatuses && signatureStatuses.value[0];
          if (!done) {
            if (!status) {
              console.log('REST null result for', txid, status);
            } else if (status.err) {
              console.log('REST error for', txid, status);
              done = true;
              reject(status.err);
            } else if (!status.confirmations) {
              console.log('REST no confirmations for', txid, status);
            } else {
              console.log('REST confirmation for', txid, status);
              done = true;
              resolve(status);
            }
          }
        } catch (e) {
          if (!done) {
            console.log('REST connection error: txid', txid, e);
          }
        }

        await sleep(2000);
      }
    })();
  })
    .catch((err) => {
      //@ts-ignore
      if (connection._signatureSubscriptions[subId]) {
        connection.removeSignatureListener(subId);
      }
    })
    .then((_) => {
      //@ts-ignore
      if (connection._signatureSubscriptions[subId]) {
        connection.removeSignatureListener(subId);
      }
    });
  done = true;
  return status;
}
