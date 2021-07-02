import { AccountLayout, NATIVE_MINT, Token } from '@solana/spl-token';
import { Account, Connection, TransactionInstruction } from '@solana/web3.js';

import { ParsedAccount } from 'app/contexts/accounts';
import { sendTransaction } from 'app/contexts/connection';
import { approve, Obligation, repayObligationLiquidityInstruction, Reserve, TokenAccount } from 'app/models';
import { TOKEN_PROGRAM_ID } from 'utils/ids';
import { notify } from 'utils/notifications';

import { createTokenAccount } from './account';
import { refreshObligationAndReserves } from './helpers/refreshObligationAndReserves';

export const repay = async (
  connection: Connection,
  wallet: any,
  liquidityAmount: number,
  source: TokenAccount,
  repayReserve: ParsedAccount<Reserve>,
  obligation: ParsedAccount<Obligation>
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

  let sourceLiquidity = source.pubkey;
  if (wallet.publicKey.equals(sourceLiquidity) && repayReserve.info.liquidity.mintPubkey.equals(NATIVE_MINT)) {
    sourceLiquidity = createTokenAccount(
      instructions,
      wallet.publicKey,
      accountRentExempt + liquidityAmount,
      NATIVE_MINT,
      wallet.publicKey,
      signers
    );
    cleanupInstructions.push(
      Token.createCloseAccountInstruction(TOKEN_PROGRAM_ID, sourceLiquidity, wallet.publicKey, wallet.publicKey, [])
    );
  }

  // create approval for transfer transactions
  const transferAuthority = approve(
    instructions,
    cleanupInstructions,
    sourceLiquidity,
    wallet.publicKey,
    liquidityAmount
  );

  signers.push(transferAuthority);

  instructions.push(
    ...(await refreshObligationAndReserves(connection, obligation)),
    repayObligationLiquidityInstruction(
      liquidityAmount,
      sourceLiquidity,
      repayReserve.info.liquidity.supplyPubkey,
      repayReserve.pubkey,
      obligation.pubkey,
      repayReserve.info.lendingMarket,
      transferAuthority.publicKey
    )
  );

  // FIXME: need for recalculation data for max withdraw/borrow/repay amount
  instructions.push(...(await refreshObligationAndReserves(connection, obligation)));

  try {
    const { txid } = await sendTransaction(connection, wallet, instructions.concat(cleanupInstructions), signers, true);

    notify({
      message: 'Funds repaid.',
      type: 'success',
      description: `Transaction - ${txid}`,
    });
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
