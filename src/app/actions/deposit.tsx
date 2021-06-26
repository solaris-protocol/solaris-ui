import { AccountLayout } from '@solana/spl-token';
import { Account, Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';

import { sendTransaction } from 'app/contexts/connection/connection';
import { WalletAdapter } from 'app/contexts/wallet';
import {
  approve,
  depositObligationCollateralInstruction,
  depositReserveLiquidityInstruction,
  initObligationInstruction,
  ObligationLayout,
  refreshObligationInstruction,
  refreshReserveInstruction,
  Reserve,
  TokenAccount,
} from 'app/models';
import { EnrichedLendingObligation } from 'hooks';
import { LENDING_PROGRAM_ID } from 'utils/ids';
import { notify } from 'utils/notifications';

import { createUninitializedObligation, ensureSplAccount, findOrCreateAccountByMint } from './account';

export const deposit = async (
  connection: Connection,
  wallet: WalletAdapter,
  source: TokenAccount,
  liquidityAmount: number,
  reserve: Reserve,
  reserveAddress: PublicKey,
  obligation?: EnrichedLendingObligation
) => {
  if (!wallet.publicKey) {
    throw new Error('Wallet is not connected');
  }

  notify({
    message: 'Depositing funds...',
    description: 'Please review transactions to approve.',
    type: 'warn',
  });

  // user from account
  const signers: Account[] = [];
  const instructions: TransactionInstruction[] = [];
  const cleanupInstructions: TransactionInstruction[] = [];

  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);
  const obligationRentExempt = await connection.getMinimumBalanceForRentExemption(ObligationLayout.span);

  const [lendingMarketAuthority] = await PublicKey.findProgramAddress(
    [reserve.lendingMarket.toBuffer()], // which account should be authority
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
  const transferAuthority = approve(
    instructions,
    cleanupInstructions,
    sourceLiquidityAccount,
    wallet.publicKey,
    liquidityAmount
  );
  signers.push(transferAuthority);

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
    reserve.collateral.mintPubkey,
    signers
  );

  instructions.push(refreshReserveInstruction(reserveAddress, reserve.liquidity.oraclePubkey));
  instructions.push(
    depositReserveLiquidityInstruction(
      liquidityAmount,
      sourceLiquidityAccount,
      destinationCollateralAccount,
      reserveAddress,
      reserve.liquidity.supplyPubkey,
      reserve.collateral.mintPubkey,
      reserve.lendingMarket,
      lendingMarketAuthority,
      transferAuthority.publicKey
    )
  );

  /*
   *  Obligation
   */
  const collateralAmount = liquidityAmount;
  const sourceCollateral = destinationCollateralAccount;

  let obligationAccount;
  // if obligation exists
  if (obligation) {
    obligationAccount = obligation.account.pubkey;
  } else {
    obligationAccount = createUninitializedObligation(instructions, wallet.publicKey, obligationRentExempt, signers);
    instructions.push(initObligationInstruction(obligationAccount, reserve.lendingMarket, wallet.publicKey));
  }

  // create approval for deposit obligation collateral transactions
  const depositObligationCollateralAuthority = approve(
    instructions,
    cleanupInstructions,
    destinationCollateralAccount,
    wallet.publicKey,
    collateralAmount
  );
  signers.push(depositObligationCollateralAuthority);

  instructions.push(refreshReserveInstruction(reserveAddress, reserve.liquidity.oraclePubkey));
  instructions.push(
    depositObligationCollateralInstruction(
      collateralAmount,
      sourceCollateral,
      reserve.collateral.supplyPubkey,
      reserveAddress,
      obligationAccount,
      reserve.lendingMarket,
      lendingMarketAuthority,
      wallet.publicKey,
      depositObligationCollateralAuthority.publicKey
    )
  );

  try {
    const tx = await sendTransaction(connection, wallet, instructions.concat(cleanupInstructions), signers, true);

    notify({
      message: 'Funds deposited.',
      type: 'success',
      description: `Transaction - ${tx}`,
    });
  } catch (error) {
    // TODO:
    console.error(error);
    throw error;
  }
};
