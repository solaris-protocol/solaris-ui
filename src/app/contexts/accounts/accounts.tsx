import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AccountLayout, MintInfo, u64 } from '@solana/spl-token';
import { useWallet } from '@solana/wallet-adapter-react';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';

import { useConnection } from 'app/contexts/connection';
import { deserializeAccount, TokenAccount, TokenAccountParser } from 'app/models';
import { LEND_HOST_FEE_ADDRESS, programIds, WRAPPED_SOL_MINT } from 'utils/ids';
import { chunks } from 'utils/utils';

import { cache, genericCache } from './cache';

export interface ParsedAccountBase {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
  info: any; // TODO: change to unkown
}

export type AccountParser = (pubkey: PublicKey, data: AccountInfo<Buffer>) => ParsedAccountBase | undefined;

export interface ParsedAccount<T> extends ParsedAccountBase {
  info: T;
}

interface AccountsContextState {
  userAccounts: TokenAccount[];
  nativeAccount?: AccountInfo<Buffer>;
}

const AccountsContext = React.createContext<AccountsContextState>({
  userAccounts: [],
  nativeAccount: undefined,
});

export const keyToAccountParser = new Map<string, AccountParser>();

export const useAccountsContext = () => {
  const context = useContext(AccountsContext);
  return context;
};

function wrapNativeAccount(pubkey: PublicKey, account?: AccountInfo<Buffer>): TokenAccount | undefined {
  if (!account) {
    return undefined;
  }

  return {
    pubkey: pubkey,
    account,
    info: {
      address: pubkey,
      mint: WRAPPED_SOL_MINT,
      owner: pubkey,
      amount: new u64(account.lamports),
      delegate: null,
      delegatedAmount: new u64(0),
      isInitialized: true,
      isFrozen: false,
      isNative: true,
      rentExemptReserve: null,
      closeAuthority: null,
    },
  };
}

export const getCachedAccount = (predicate: (account: TokenAccount) => boolean) => {
  for (const account of genericCache.values()) {
    if (predicate(account)) {
      return account as TokenAccount;
    }
  }
};

const UseNativeAccount = () => {
  const connection = useConnection();
  const wallet = useWallet();

  const [nativeAccount, setNativeAccount] = useState<AccountInfo<Buffer>>();

  const updateCache = useCallback(
    (account) => {
      if (wallet && wallet.publicKey) {
        const wrapped = wrapNativeAccount(wallet.publicKey, account);
        if (wrapped !== undefined && wallet) {
          const id = wallet.publicKey?.toBase58();
          cache.registerParser(id, TokenAccountParser);
          genericCache.set(id, wrapped as TokenAccount);
          cache.emitter.raiseCacheUpdated(id, false, TokenAccountParser);
        }
      }
    },
    [wallet]
  );

  useEffect(() => {
    let subId = 0;
    const updateAccount = (account: AccountInfo<Buffer> | null) => {
      if (account) {
        updateCache(account);
        setNativeAccount(account);
      }
    };

    (async () => {
      if (!connection || !wallet?.publicKey) {
        return;
      }

      const account = await connection.getAccountInfo(wallet.publicKey);
      updateAccount(account);

      subId = connection.onAccountChange(wallet.publicKey, updateAccount);
    })();

    return () => {
      if (subId) {
        connection.removeAccountChangeListener(subId);
      }
    };
  }, [setNativeAccount, wallet, wallet?.publicKey, connection, updateCache]);

  return { nativeAccount };
};

const PRECACHED_OWNERS = new Set<string>();
const precacheUserTokenAccounts = async (connection: Connection, owner?: PublicKey) => {
  if (!owner) {
    return;
  }

  // used for filtering account updates over websocket
  PRECACHED_OWNERS.add(owner.toBase58());

  // user accounts are updated via ws subscription
  const accounts = await connection.getTokenAccountsByOwner(owner, {
    programId: programIds().token,
  });
  accounts.value.forEach((info) => {
    cache.add(info.pubkey.toBase58(), info.account, TokenAccountParser);
  });
};

export function AccountsProvider({ children = null as any }) {
  const connection = useConnection();
  const wallet = useWallet();
  const [tokenAccounts, setTokenAccounts] = useState<TokenAccount[]>([]);
  const [userAccounts, setUserAccounts] = useState<TokenAccount[]>([]);
  const { nativeAccount } = UseNativeAccount();

  const selectUserAccounts = useCallback(() => {
    return cache
      .byParser(TokenAccountParser)
      .map((id) => cache.get(id))
      .filter((a) => a && a.info.owner.toBase58() === wallet?.publicKey?.toBase58())
      .map((a) => a as TokenAccount);
  }, [wallet]);

  useEffect(() => {
    const accounts = selectUserAccounts().filter((a) => a !== undefined) as TokenAccount[];
    setUserAccounts(accounts);
  }, [nativeAccount, wallet, tokenAccounts, selectUserAccounts]);

  useEffect(() => {
    const subs: number[] = [];
    cache.emitter.onCache((args) => {
      if (args.isNew) {
        const id = args.id;
        const deserialize = args.parser;
        connection.onAccountChange(new PublicKey(id), (info) => {
          cache.add(id, info, deserialize);
        });
      }
    });

    return () => {
      subs.forEach((id) => connection.removeAccountChangeListener(id));
    };
  }, [connection]);

  const publicKey = wallet?.publicKey;
  useEffect(() => {
    if (!connection) {
      setTokenAccounts([]);
    } else if (!publicKey) {
      setTokenAccounts([]);
    } else {
      precacheUserTokenAccounts(connection, LEND_HOST_FEE_ADDRESS);

      precacheUserTokenAccounts(connection, publicKey).then(() => {
        setTokenAccounts(selectUserAccounts());
      });

      // only get accounts that are owned by user
      const filters = [
        {
          memcmp: {
            offset: 32,
            bytes: publicKey.toBase58(),
          },
        },
        {
          dataSize: AccountLayout.span,
        },
      ];

      // This can return different types of accounts: token-account, mint, multisig
      const tokenSubID = connection.onProgramAccountChange(
        programIds().token,
        (info) => {
          // TODO: do we need a better way to identify layout (maybe a enum identifing type?)
          if (info.accountInfo.data.length === AccountLayout.span) {
            const data = deserializeAccount(info.accountInfo.data);

            if (PRECACHED_OWNERS.has(data.owner.toBase58())) {
              cache.add(info.accountId, info.accountInfo, TokenAccountParser);
              setTokenAccounts(selectUserAccounts());
            }
          }
        },
        'singleGossip',
        filters
      );

      return () => {
        connection.removeProgramAccountChangeListener(tokenSubID);
      };
    }
  }, [connection, wallet.connected, publicKey, selectUserAccounts]);

  return (
    <AccountsContext.Provider
      value={{
        userAccounts,
        nativeAccount,
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
}

export function useNativeAccount() {
  const context = useContext(AccountsContext);
  return {
    account: context.nativeAccount as AccountInfo<Buffer>,
  };
}

export const getMultipleAccounts = async (connection: any, keys: string[], commitment: string) => {
  const result = await Promise.all(
    chunks(keys, 99).map((chunk) => getMultipleAccountsCore(connection, chunk, commitment))
  );

  const array = result
    .map(
      (a) =>
        a.array
          .map((acc) => {
            if (!acc) {
              return undefined;
            }

            const { data, ...rest } = acc;
            const obj = {
              ...rest,
              data: Buffer.from(data[0], 'base64'),
            } as AccountInfo<Buffer>;
            return obj;
          })
          .filter((_) => _) as AccountInfo<Buffer>[]
    )
    .flat();
  return { keys, array };
};

const getMultipleAccountsCore = async (connection: any, keys: string[], commitment: string) => {
  const args = connection._buildArgs([keys], commitment, 'base64');

  const unsafeRes = await connection._rpcRequest('getMultipleAccounts', args);
  if (unsafeRes.error) {
    throw new Error('failed to get info about account ' + unsafeRes.error.message);
  }

  if (unsafeRes.result.value) {
    const array = unsafeRes.result.value as AccountInfo<string[]>[];
    return { keys, array };
  }

  // TODO: fix
  throw new Error();
};

export function useMint(key?: string | PublicKey) {
  const connection = useConnection();

  const id = typeof key === 'string' ? key : key?.toBase58();

  const [mint, setMint] = useState<MintInfo | undefined>(id ? cache.getMint(id) : undefined);

  useEffect(() => {
    if (!id) {
      return;
    }

    cache
      .queryMint(connection, id)
      .then((mintInfo) => {
        setMint(mintInfo);
      })
      .catch((err) => console.log(err));

    const dispose = cache.emitter.onCache((e) => {
      const event = e;
      if (event.id === id) {
        cache.queryMint(connection, id).then((mintInfo) => setMint(mintInfo));
      }
    });
    return () => {
      dispose();
    };
  }, [connection, id]);

  return mint;
}

export function useAccount(pubKey?: PublicKey) {
  const connection = useConnection();
  const [account, setAccount] = useState<TokenAccount>();

  const key = pubKey?.toBase58();
  useEffect(() => {
    const query = async () => {
      try {
        if (!key) {
          return;
        }

        const acc = await cache.query(connection, key, TokenAccountParser).catch((err) => console.log(err));
        if (acc) {
          setAccount(acc);
        }
      } catch (err) {
        console.error(err);
      }
    };

    query();

    const dispose = cache.emitter.onCache((e) => {
      const event = e;
      if (event.id === key) {
        query();
      }
    });
    return () => {
      dispose();
    };
  }, [connection, key]);

  return account;
}
