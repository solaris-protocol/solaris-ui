import { AccountLayout } from '@solana/spl-token';
import { Account, Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';

import { sendTransaction } from 'app/contexts/connection/connection';
import { WalletAdapter } from 'app/contexts/wallet';
import { approve, TokenAccount } from 'app/models';
import { redeemReserveCollateralInstruction, refreshReserveInstruction, Reserve } from 'app/models/lending';
import { LENDING_PROGRAM_ID } from 'utils/ids';
import { notify } from 'utils/notifications';

import { findOrCreateAccountByMint } from './account';

export const withdraw = async (
  from: TokenAccount, // CollateralAccount
  amountLamports: number, // in collateral token (lamports)
  reserve: Reserve,
  reserveAddress: PublicKey,
  connection: Connection,
  wallet: WalletAdapter
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

  const [authority] = await PublicKey.findProgramAddress([reserve.lendingMarket.toBuffer()], LENDING_PROGRAM_ID);

  const fromAccount = from.pubkey;

  // create approval for transfer transactions
  const transferAuthority = approve(instructions, cleanupInstructions, fromAccount, wallet.publicKey, amountLamports);

  signers.push(transferAuthority);

  // get destination account
  const toAccount = await findOrCreateAccountByMint(
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
    redeemReserveCollateralInstruction({
      collateralAmount: amountLamports,
      sourceCollateralPubkey: fromAccount,
      destinationLiquidityPubkey: toAccount,
      reservePubkey: reserveAddress,
      reserveCollateralMintPubkey: reserve.collateral.mintPubkey,
      reserveLiquiditySupplyPubkey: reserve.liquidity.supplyPubkey,
      lendingMarketPubkey: reserve.lendingMarket,
      lendingMarketDerivedAuthorityPubkey: authority,
      userTransferAuthorityPubkey: transferAuthority.publicKey,
      pythPricePubkey: reserve.liquidity.oraclePubkey,
    })
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
