import { AccountLayout } from '@solana/spl-token';
import { WalletAdapter } from '@solana/wallet-base';
import { Account, Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';

import { cache, ParsedAccount } from 'app/contexts/accounts';
import { sendTransaction } from 'app/contexts/connection/connection';
import {
  approve,
  Obligation,
  ObligationParser,
  TokenAccount,
  withdrawObligationCollateralInstruction,
} from 'app/models';
import { redeemReserveCollateralInstruction, refreshReserveInstruction, Reserve } from 'app/models';
import { LENDING_PROGRAM_ID } from 'utils/ids';
import { notify } from 'utils/notifications';

import { findOrCreateAccountByMint } from './account';
import { refreshObligationAndReserves } from './helpers/refreshObligationAndReserves';

export const withdraw = async (
  connection: Connection,
  wallet: WalletAdapter,
  source: TokenAccount, // CollateralAccount
  collateralAmount: number, // in collateral token (lamports)
  reserve: ParsedAccount<Reserve>,
  obligation: ParsedAccount<Obligation>
) => {
  if (!wallet.publicKey) {
    throw new Error('Wallet is not connected');
  }

  notify({
    message: 'Withdrawing funds...',
    description: 'Please review transactions to approve.',
    type: 'warn',
  });

  // user from account
  const signers: Account[] = [];
  const instructions: TransactionInstruction[] = [];
  const cleanupInstructions: TransactionInstruction[] = [];

  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

  const [lendingMarketAuthority] = await PublicKey.findProgramAddress(
    [reserve.info.lendingMarket.toBuffer()],
    LENDING_PROGRAM_ID
  );

  const sourceCollateral = source.pubkey;

  // create approval for transfer transactions
  const transferAuthority = approve(
    instructions,
    cleanupInstructions,
    sourceCollateral,
    wallet.publicKey,
    collateralAmount
  );
  signers.push(transferAuthority);

  // get destination account
  const destinationCollateral = await findOrCreateAccountByMint(
    wallet.publicKey,
    wallet.publicKey,
    instructions,
    cleanupInstructions,
    accountRentExempt,
    reserve.info.collateral.mintPubkey,
    signers
  );

  /*
   * Obligation
   */
  instructions.push(...(await refreshObligationAndReserves(connection, obligation)));
  instructions.push(
    withdrawObligationCollateralInstruction(
      collateralAmount,
      reserve.info.collateral.supplyPubkey,
      destinationCollateral,
      reserve.pubkey,
      obligation.pubkey,
      reserve.info.lendingMarket,
      lendingMarketAuthority,
      wallet.publicKey
    )
  );

  /*
   *  Reserve
   */
  // get destination account
  const destinationLiquidity = await findOrCreateAccountByMint(
    wallet.publicKey,
    wallet.publicKey,
    instructions,
    cleanupInstructions,
    accountRentExempt,
    reserve.info.liquidity.mintPubkey,
    signers
  );

  instructions.push(refreshReserveInstruction(reserve.pubkey, reserve.info.liquidity.oraclePubkey));
  instructions.push(
    redeemReserveCollateralInstruction(
      collateralAmount,
      sourceCollateral,
      destinationLiquidity,
      reserve.pubkey,
      reserve.info.collateral.mintPubkey,
      reserve.info.liquidity.supplyPubkey,
      reserve.info.lendingMarket,
      lendingMarketAuthority,
      transferAuthority.publicKey
    )
  );

  try {
    const { txid } = await sendTransaction(connection, wallet, instructions.concat(cleanupInstructions), signers, true);

    notify({
      message: 'Funds withdrawn.',
      type: 'success',
      description: `Transaction - ${txid}`,
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
      obligation.pubkey,
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
