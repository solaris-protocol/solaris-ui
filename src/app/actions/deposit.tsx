import { AccountLayout } from '@solana/spl-token';
import { Account, Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';

import { sendTransaction } from 'app/contexts/connection/connection';
import { WalletAdapter } from 'app/contexts/wallet';
import { approve, TokenAccount } from 'app/models';
import { depositReserveLiquidityInstruction, refreshReserveInstruction, Reserve } from 'app/models/lending';
import { LENDING_PROGRAM_ID } from 'utils/ids';
import { notify } from 'utils/notifications';

import { createUninitializedAccount, ensureSplAccount, findOrCreateAccountByMint } from './account';

export const deposit = async (
  from: TokenAccount,
  amountLamports: number,
  reserve: Reserve,
  reserveAddress: PublicKey,
  connection: Connection,
  wallet: WalletAdapter
) => {
  if (!wallet.publicKey) {
    throw new Error('Wallet is not connected');
  }

  notify({
    message: 'Depositing funds...',
    description: 'Please review transactions to approve.',
    type: 'warn',
  });

  const isInitialized = true; // TODO: finish reserve init

  // user from account
  const signers: Account[] = [];
  const instructions: TransactionInstruction[] = [];
  const cleanupInstructions: TransactionInstruction[] = [];

  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

  const [authority] = await PublicKey.findProgramAddress(
    [reserve.lendingMarket.toBuffer()], // which account should be authority
    LENDING_PROGRAM_ID
  );

  const fromAccount = ensureSplAccount(
    instructions,
    cleanupInstructions,
    from,
    wallet.publicKey,
    amountLamports + accountRentExempt,
    signers
  );

  // create approval for transfer transactions
  const transferAuthority = approve(instructions, cleanupInstructions, fromAccount, wallet.publicKey, amountLamports);

  signers.push(transferAuthority);

  let toAccount: PublicKey;
  if (isInitialized) {
    // get destination account
    toAccount = await findOrCreateAccountByMint(
      wallet.publicKey,
      wallet.publicKey,
      instructions,
      cleanupInstructions,
      accountRentExempt,
      reserve.collateral.mintPubkey,
      signers
    );
  } else {
    toAccount = createUninitializedAccount(instructions, wallet.publicKey, accountRentExempt, signers);
  }

  if (isInitialized) {
    instructions.push(refreshReserveInstruction(reserveAddress, reserve.liquidity.oraclePubkey));
    instructions.push(
      depositReserveLiquidityInstruction({
        liquidityAmount: amountLamports,
        sourceLiquidityPubkey: fromAccount,
        destinationCollateralPubkey: toAccount,
        reservePubkey: reserveAddress,
        reserveLiquiditySupplyPubkey: reserve.liquidity.supplyPubkey,
        reserveCollateralMintPubkey: reserve.collateral.mintPubkey,
        lendingMarketPubkey: reserve.lendingMarket,
        lendingMarketDerivedAuthorityPubkey: authority,
        userTransferAuthorityPubkey: transferAuthority.publicKey,
        pythPricePubkey: reserve.liquidity.oraclePubkey,
      })
    );
  }

  try {
    const tx = await sendTransaction(connection, wallet, instructions.concat(cleanupInstructions), signers, true);

    notify({
      message: 'Funds deposited.',
      type: 'success',
      description: `Transaction - ${tx}`,
    });
  } catch (error) {
    // TODO:
    throw error;
  }
};
