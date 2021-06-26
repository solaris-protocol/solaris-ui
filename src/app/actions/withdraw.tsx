import { AccountLayout } from '@solana/spl-token';
import { Account, Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';

import { cache, ParsedAccount } from 'app/contexts/accounts';
import { sendTransaction } from 'app/contexts/connection/connection';
import { WalletAdapter } from 'app/contexts/wallet';
import {
  approve,
  refreshObligationInstruction,
  TokenAccount,
  withdrawObligationCollateralInstruction,
} from 'app/models';
import { redeemReserveCollateralInstruction, refreshReserveInstruction, Reserve } from 'app/models';
import { EnrichedLendingObligation } from 'hooks';
import { LENDING_PROGRAM_ID } from 'utils/ids';
import { notify } from 'utils/notifications';

import { findOrCreateAccountByMint } from './account';
import { refreshObligationAndReserves } from './helpers/refreshObligationAndReserves';

export const withdraw = async (
  connection: Connection,
  wallet: WalletAdapter,
  source: TokenAccount, // CollateralAccount
  collateralAmount: number, // in collateral token (lamports)
  reserve: Reserve,
  reserveAddress: PublicKey,
  obligation: EnrichedLendingObligation
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
    [reserve.lendingMarket.toBuffer()],
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
    reserve.collateral.mintPubkey,
    signers
  );

  /*
   * Obligation
   */
  // const depositPubkeys = obligation.info.deposits.map((collateral) => collateral.depositReserve);
  // const borrowPubkeys = obligation.info.borrows.map((liquidity) => liquidity.borrowReserve);
  //
  // const obligationReservesAndOraclesPubkeys = [...new Set([...depositPubkeys, ...borrowPubkeys])].map(
  //   (reservePubkey) => {
  //     const reserveAccountInfo = cache.get(reservePubkey);
  //
  //     if (!reserveAccountInfo) {
  //       throw 'Error: cannot find the reserve account';
  //     }
  //
  //     return {
  //       reservePubkey: reservePubkey,
  //       oraclePubkey: reserveAccountInfo.info.liquidity.oraclePubkey,
  //     };
  //   }
  // );
  //
  // for (const reserveAndOraclePubkeys of obligationReservesAndOraclesPubkeys) {
  //   instructions.push(
  //     refreshReserveInstruction(reserveAndOraclePubkeys.reservePubkey, reserveAndOraclePubkeys.oraclePubkey)
  //   );
  // }

  instructions.push(...(await refreshObligationAndReserves(connection, obligation)));

  instructions.push(
    refreshObligationInstruction(
      obligation.account.pubkey,
      obligation.info.deposits.map((collateral) => collateral.depositReserve),
      obligation.info.borrows.map((liquidity) => liquidity.borrowReserve)
    )
  );
  instructions.push(
    withdrawObligationCollateralInstruction(
      collateralAmount,
      reserve.collateral.supplyPubkey,
      destinationCollateral,
      reserveAddress,
      obligation.account.pubkey,
      reserve.lendingMarket,
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
    reserve.liquidity.mintPubkey,
    signers
  );

  instructions.push(refreshReserveInstruction(reserveAddress, reserve.liquidity.oraclePubkey));
  instructions.push(
    redeemReserveCollateralInstruction(
      collateralAmount,
      sourceCollateral,
      destinationLiquidity,
      reserveAddress,
      reserve.collateral.mintPubkey,
      reserve.liquidity.supplyPubkey,
      reserve.lendingMarket,
      lendingMarketAuthority,
      transferAuthority.publicKey
    )
  );

  try {
    const tx = await sendTransaction(connection, wallet, instructions.concat(cleanupInstructions), signers, true);

    notify({
      message: 'Funds withdrawn.',
      type: 'success',
      description: `Transaction - ${tx}`,
    });
  } catch (error) {
    // TODO:
    throw error;
  }
};
