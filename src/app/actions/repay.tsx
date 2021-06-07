import { AccountLayout, NATIVE_MINT, Token } from '@solana/spl-token';
import { Account, Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';

import { ParsedAccount } from 'app/contexts/accounts';
import { sendTransaction } from 'app/contexts/connection';
import { WalletAdapter } from 'app/contexts/wallet';
import { Reserve } from 'app/models';
import { approve, LendingObligation, TokenAccount } from 'app/models';
import { repayInstruction } from 'app/models/lending/repay';
import { LENDING_PROGRAM_ID, TOKEN_PROGRAM_ID } from 'utils/ids';
import { notify } from 'utils/notifications';

import { createTokenAccount, findOrCreateAccountByMint } from './account';

export const repay = async (
  from: TokenAccount,
  repayAmount: number,

  // which loan to repay
  obligation: ParsedAccount<LendingObligation>,

  obligationToken: TokenAccount,

  repayReserve: ParsedAccount<Reserve>,

  withdrawReserve: ParsedAccount<Reserve>,

  connection: Connection,
  wallet: WalletAdapter
) => {
  if (!wallet.publicKey) {
    throw new Error('Wallet is not connected');
  }

  notify({
    message: 'Repaying funds...',
    description: 'Please review transactions to approve.',
    type: 'warn',
  });

  // user from account
  const signers: Account[] = [];
  const instructions: TransactionInstruction[] = [];
  const cleanupInstructions: TransactionInstruction[] = [];

  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

  const [authority] = await PublicKey.findProgramAddress(
    [repayReserve.info.lendingMarket.toBuffer()],
    LENDING_PROGRAM_ID
  );

  let fromAccount = from.pubkey;
  if (wallet.publicKey.equals(fromAccount) && repayReserve.info.liquidity.mintPubkey.equals(NATIVE_MINT)) {
    fromAccount = createTokenAccount(
      instructions,
      wallet.publicKey,
      accountRentExempt + repayAmount,
      NATIVE_MINT,
      wallet.publicKey,
      signers
    );
    cleanupInstructions.push(
      Token.createCloseAccountInstruction(TOKEN_PROGRAM_ID, fromAccount, wallet.publicKey, wallet.publicKey, [])
    );
  }

  // create approval for transfer transactions
  const transferAuthority = approve(instructions, cleanupInstructions, fromAccount, wallet.publicKey, repayAmount);
  signers.push(transferAuthority);

  // get destination account
  const toAccount = await findOrCreateAccountByMint(
    wallet.publicKey,
    wallet.publicKey,
    instructions,
    cleanupInstructions,
    accountRentExempt,
    withdrawReserve.info.collateral.mintPubkey,
    signers
  );

  // create approval for transfer transactions
  approve(
    instructions,
    cleanupInstructions,
    obligationToken.pubkey,
    wallet.publicKey,
    obligationToken.info.amount.toNumber(),
    true,
    // reuse transfer authority
    transferAuthority.publicKey
  );

  // TODO: rewrite
  // instructions.push(accrueInterestInstruction(repayReserve.pubkey, withdrawReserve.pubkey));

  instructions.push(
    repayInstruction(
      repayAmount,
      fromAccount,
      toAccount,
      repayReserve.pubkey,
      repayReserve.info.liquidity.supplyPubkey,
      withdrawReserve.pubkey,
      withdrawReserve.info.collateral.supplyPubkey,
      obligation.pubkey,
      obligation.info.tokenMint,
      obligationToken.pubkey,
      repayReserve.info.lendingMarket,
      authority,
      transferAuthority.publicKey
    )
  );

  const tx = await sendTransaction(connection, wallet, instructions.concat(cleanupInstructions), signers, true);

  notify({
    message: 'Funds repaid.',
    type: 'success',
    description: `Transaction - ${tx}`,
  });
};
