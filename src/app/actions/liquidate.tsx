import { AccountLayout } from '@solana/spl-token';
import { Account, Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';

import { cache, ParsedAccount } from 'app/contexts/accounts';
import { sendTransaction } from 'app/contexts/connection';
import { WalletAdapter } from 'app/contexts/wallet';
import { Reserve } from 'app/models';
import { approve, LendingMarket, Obligation, TokenAccount } from 'app/models';
import { liquidateInstruction } from 'app/models/lending/liquidate';
import { LENDING_PROGRAM_ID } from 'utils/ids';
import { notify } from 'utils/notifications';

import { createTempMemoryAccount, ensureSplAccount, findOrCreateAccountByMint } from './account';

export const liquidate = async (
  connection: Connection,
  wallet: WalletAdapter,
  from: TokenAccount, // liquidity account
  amountLamports: number, // in liquidty token (lamports)

  // which loan to repay
  obligation: ParsedAccount<Obligation>,

  repayReserve: ParsedAccount<Reserve>,

  withdrawReserve: ParsedAccount<Reserve>
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

  // @ts-ignore
  const dexMarketAddress = repayReserve.info.dexMarketOption
    ? // @ts-ignore
      repayReserve.info.dexMarket
    : // @ts-ignore
      withdrawReserve.info.dexMarket;
  const dexMarket = cache.get(dexMarketAddress);

  if (!dexMarket) {
    throw new Error(`Dex market doesn't exist.`);
  }

  const market = cache.get(withdrawReserve.info.lendingMarket) as ParsedAccount<LendingMarket>;

  const dexOrderBookSide = market.info.quoteTokenMint.equals(repayReserve.info.liquidity.mintPubkey)
    ? dexMarket?.info.asks
    : dexMarket?.info.bids;

  const memory = createTempMemoryAccount(instructions, wallet.publicKey, signers, LENDING_PROGRAM_ID);

  // TODO: rewrite
  // instructions.push(accrueInterestInstruction(repayReserve.pubkey, withdrawReserve.pubkey));

  instructions.push(
    liquidateInstruction(
      amountLamports,
      fromAccount,
      toAccount,
      repayReserve.pubkey,
      repayReserve.info.liquidity.supplyPubkey,
      withdrawReserve.pubkey,
      withdrawReserve.info.collateral.supplyPubkey,
      obligation.pubkey,
      repayReserve.info.lendingMarket,
      authority,
      transferAuthority.publicKey,
      dexMarketAddress,
      dexOrderBookSide,
      memory
    )
  );

  const tx = await sendTransaction(connection, wallet, instructions.concat(cleanupInstructions), signers, true);

  notify({
    message: 'Funds liquidated.',
    type: 'success',
    description: `Transaction - ${tx}`,
  });
};
