import React from 'react';

import { AccountLayout } from '@solana/spl-token';
import { WalletAdapter } from '@solana/wallet-base';
import { Account, Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';

import { refreshObligationAndReserves } from 'app/actions/helpers/refreshObligationAndReserves';
import { cache, ParsedAccount } from 'app/contexts/accounts';
import { sendTransaction } from 'app/contexts/connection/connection';
import {
  collateralExchangeRate,
  depositObligationCollateralInstruction,
  depositReserveLiquidityInstruction,
  initObligationInstruction,
  Obligation,
  ObligationLayout,
  ObligationParser,
  refreshObligationInstruction,
  refreshReserveInstruction,
  Reserve,
  TokenAccount,
} from 'app/models';
import { ExplorerLink } from 'components/common/ExplorerLink';
import { LENDING_PROGRAM_ID } from 'utils/ids';
import { notify } from 'utils/notifications';

import { createUninitializedObligation, ensureSplAccount, findOrCreateAccountByMint } from './account';

export const deposit = async (
  connection: Connection,
  wallet: WalletAdapter,
  source: TokenAccount,
  liquidityAmount: number,
  reserve: ParsedAccount<Reserve>,
  obligation?: ParsedAccount<Obligation>
) => {
  if (!wallet.publicKey) {
    throw new Error('Wallet is not connected');
  }

  notify({
    message: 'Depositing funds...',
    description: 'Please review transactions to approve.',
    type: 'warn',
  });

  const signers: Account[] = [];
  const instructions: TransactionInstruction[] = [];
  const cleanupInstructions: TransactionInstruction[] = [];

  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);
  const obligationRentExempt = await connection.getMinimumBalanceForRentExemption(ObligationLayout.span);

  const [lendingMarketAuthority] = await PublicKey.findProgramAddress(
    [reserve.info.lendingMarket.toBuffer()], // which account should be authority
    LENDING_PROGRAM_ID
  );

  const sourceLiquidityAccount = ensureSplAccount(
    instructions,
    cleanupInstructions,
    source,
    wallet.publicKey,
    liquidityAmount + accountRentExempt,
    signers
  );

  // create approval for transfer transactions
  // const transferAuthority = approve(
  //   instructions,
  //   cleanupInstructions,
  //   sourceLiquidityAccount,
  //   wallet.publicKey,
  //   liquidityAmount
  // );
  // signers.push(transferAuthority);

  /*
   *  Reserve
   */
  // get destination account
  const destinationCollateralAccount = await findOrCreateAccountByMint(
    wallet.publicKey,
    wallet.publicKey,
    instructions,
    cleanupInstructions,
    accountRentExempt,
    reserve.info.collateral.mintPubkey,
    signers
  );

  instructions.push(refreshReserveInstruction(reserve.pubkey, reserve.info.liquidity.oraclePubkey));
  instructions.push(
    depositReserveLiquidityInstruction(
      liquidityAmount,
      sourceLiquidityAccount,
      destinationCollateralAccount,
      reserve.pubkey,
      reserve.info.liquidity.supplyPubkey,
      reserve.info.collateral.mintPubkey,
      reserve.info.lendingMarket,
      lendingMarketAuthority,
      wallet.publicKey // transferAuthority.publicKey
    )
  );

  /*
   *  Obligation
   */
  // TODO: check calculation, need to get collateral amount
  const collateralAmount = liquidityAmount * collateralExchangeRate(reserve.info);
  const sourceCollateral = destinationCollateralAccount;

  let obligationAccount;
  // if obligation exists
  if (obligation) {
    obligationAccount = obligation.pubkey;
  } else {
    obligationAccount = createUninitializedObligation(instructions, wallet.publicKey, obligationRentExempt, signers);
    instructions.push(initObligationInstruction(obligationAccount, reserve.info.lendingMarket, wallet.publicKey));
  }

  // create approval for deposit obligation collateral transactions
  // const depositObligationCollateralAuthority = approve(
  //   instructions,
  //   cleanupInstructions,
  //   destinationCollateralAccount,
  //   wallet.publicKey,
  //   collateralAmount
  // );
  // signers.push(depositObligationCollateralAuthority);

  instructions.push(refreshReserveInstruction(reserve.pubkey, reserve.info.liquidity.oraclePubkey));
  instructions.push(
    depositObligationCollateralInstruction(
      collateralAmount,
      sourceCollateral,
      reserve.info.collateral.supplyPubkey,
      reserve.pubkey,
      obligationAccount,
      reserve.info.lendingMarket,
      lendingMarketAuthority,
      wallet.publicKey,
      wallet.publicKey //depositObligationCollateralAuthority.publicKey
    )
  );

  try {
    const { txid } = await sendTransaction(connection, wallet, instructions.concat(cleanupInstructions), signers, true);

    notify({
      message: 'Funds deposited.',
      type: 'success',
      description: (
        <>
          Transaction - <ExplorerLink address={txid} type="transaction" short connection={connection} />
        </>
      ),
    });
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }

  // need for recalculation data for max withdraw/borrow/repay amount
  try {
    notify({
      message: 'Updating obligation and reserves.',
      description: 'Please review transactions to approve.',
      type: 'warn',
    });

    const updatedObligation = (await cache.query(
      connection,
      obligationAccount,
      ObligationParser
    )) as ParsedAccount<Obligation>;

    const { txid } = await sendTransaction(
      connection,
      wallet,
      [...(await refreshObligationAndReserves(connection, updatedObligation))],
      [],
      true
    );

    notify({
      message: 'Obligation and reserves updated.',
      type: 'success',
      description: `Transaction - ${txid}`,
    });
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
