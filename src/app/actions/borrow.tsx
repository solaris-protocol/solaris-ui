import { AccountLayout, MintInfo, MintLayout } from '@solana/spl-token';
import { Account, Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';

import { cache, MintParser, ParsedAccount } from 'app/contexts/accounts';
import { sendTransaction } from 'app/contexts/connection';
import { WalletAdapter } from 'app/contexts/wallet';
import { Reserve } from 'app/models';
import {
  approve,
  BorrowAmountType,
  borrowInstruction,
  initObligationInstruction,
  LendingMarket,
  LendingObligation,
  LendingObligationLayout,
  TokenAccount,
} from 'app/models';
import { LEND_HOST_FEE_ADDRESS, LENDING_PROGRAM_ID } from 'utils/ids';
import { notify } from 'utils/notifications';
import { toLamports } from 'utils/utils';

import {
  createTempMemoryAccount,
  createUninitializedAccount,
  createUninitializedMint,
  createUninitializedObligation,
  ensureSplAccount,
  findOrCreateAccountByMint,
} from './account';

export const borrow = async (
  connection: Connection,
  wallet: WalletAdapter,

  from: TokenAccount,
  amount: number,
  amountType: BorrowAmountType,

  borrowReserve: ParsedAccount<Reserve>,

  depositReserve: ParsedAccount<Reserve>,

  existingObligation?: ParsedAccount<LendingObligation>,

  obligationAccount?: PublicKey
) => {
  if (!wallet.publicKey) {
    throw new Error('Wallet is not connected');
  }

  notify({
    message: 'Borrowing funds...',
    description: 'Please review transactions to approve.',
    type: 'warn',
  });

  let signers: Account[] = [];
  let instructions: TransactionInstruction[] = [];
  let cleanupInstructions: TransactionInstruction[] = [];
  const finalCleanupInstructions: TransactionInstruction[] = [];

  const [authority] = await PublicKey.findProgramAddress(
    [depositReserve.info.lendingMarket.toBuffer()],
    LENDING_PROGRAM_ID
  );

  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

  const obligation = existingObligation
    ? existingObligation.pubkey
    : createUninitializedObligation(
        instructions,
        wallet.publicKey,
        await connection.getMinimumBalanceForRentExemption(LendingObligationLayout.span),
        signers
      );

  const obligationMint = existingObligation
    ? existingObligation.info.tokenMint
    : createUninitializedMint(
        instructions,
        wallet.publicKey,
        await connection.getMinimumBalanceForRentExemption(MintLayout.span),
        signers
      );

  const obligationTokenOutput = obligationAccount
    ? obligationAccount
    : createUninitializedAccount(instructions, wallet.publicKey, accountRentExempt, signers);

  if (!obligationAccount) {
    instructions.push(
      initObligationInstruction(
        depositReserve.pubkey,
        borrowReserve.pubkey,
        obligation,
        obligationMint,
        obligationTokenOutput,
        wallet.publicKey,
        depositReserve.info.lendingMarket,
        authority
      )
    );
  }

  // Creates host fee account if it doesn't exsist
  const hostFeeReceiver = LEND_HOST_FEE_ADDRESS
    ? findOrCreateAccountByMint(
        wallet.publicKey,
        LEND_HOST_FEE_ADDRESS,
        instructions,
        [],
        accountRentExempt,
        depositReserve.info.collateral.mintPubkey,
        signers
      )
    : undefined;

  let amountLamports = 0;
  let fromLamports = 0;
  if (amountType === BorrowAmountType.LiquidityBorrowAmount) {
    // approve max transfer
    // TODO: improve contrain by using dex market data
    const approvedAmount = from.info.amount.toNumber();

    fromLamports = approvedAmount - accountRentExempt;

    const mint = (await cache.query(
      connection,
      borrowReserve.info.collateral.mintPubkey,
      MintParser
    )) as ParsedAccount<MintInfo>;

    amountLamports = toLamports(amount, mint?.info);
  } else if (amountType === BorrowAmountType.CollateralDepositAmount) {
    const mint = (await cache.query(
      connection,
      depositReserve.info.collateral.mintPubkey,
      MintParser
    )) as ParsedAccount<MintInfo>;
    amountLamports = toLamports(amount, mint?.info);
    fromLamports = amountLamports;
  }

  const fromAccount = ensureSplAccount(
    instructions,
    finalCleanupInstructions,
    from,
    wallet.publicKey,
    fromLamports + accountRentExempt,
    signers
  );

  const toAccount = await findOrCreateAccountByMint(
    wallet.publicKey,
    wallet.publicKey,
    instructions,
    finalCleanupInstructions,
    accountRentExempt,
    borrowReserve.info.liquidity.mintPubkey,
    signers
  );

  if (instructions.length > 0) {
    // create all accounts in one transaction
    const tx = await sendTransaction(connection, wallet, instructions, [...signers]);

    notify({
      message: 'Obligation accounts created',
      description: `Transaction ${tx}`,
      type: 'success',
    });
  }

  notify({
    message: 'Borrowing funds...',
    description: 'Please review transactions to approve.',
    type: 'warn',
  });

  signers = [];
  instructions = [];
  cleanupInstructions = [...finalCleanupInstructions];

  // create approval for transfer transactions
  const transferAuthority = approve(
    instructions,
    cleanupInstructions,
    fromAccount,
    wallet.publicKey,
    fromLamports,
    false
  );
  signers.push(transferAuthority);

  // @ts-ignore
  const dexMarketAddress = borrowReserve.info.dexMarketOption
    ? // @ts-ignore
      borrowReserve.info.dexMarket
    : // @ts-ignore
      depositReserve.info.dexMarket;
  const dexMarket = cache.get(dexMarketAddress);

  if (!dexMarket) {
    throw new Error(`Dex market doesn't exist.`);
  }

  const market = cache.get(depositReserve.info.lendingMarket) as ParsedAccount<LendingMarket>;
  const dexOrderBookSide = market.info.quoteTokenMint.equals(depositReserve.info.liquidity.mintPubkey)
    ? dexMarket?.info.asks
    : dexMarket?.info.bids;

  const memory = createTempMemoryAccount(instructions, wallet.publicKey, signers, LENDING_PROGRAM_ID);

  // TODO: rewrite
  // instructions.push(accrueInterestInstruction(depositReserve.pubkey, borrowReserve.pubkey));

  // borrow
  instructions.push(
    borrowInstruction(
      amountLamports,
      amountType,
      fromAccount,
      toAccount,
      depositReserve.pubkey,
      depositReserve.info.collateral.supplyPubkey,
      depositReserve.info.liquidity.feeReceiver,

      borrowReserve.pubkey,
      borrowReserve.info.liquidity.supplyPubkey,

      obligation,
      obligationMint,
      obligationTokenOutput,

      depositReserve.info.lendingMarket,
      authority,
      transferAuthority.publicKey,

      dexMarketAddress,
      dexOrderBookSide,

      memory,

      hostFeeReceiver
    )
  );
  try {
    const tx = await sendTransaction(connection, wallet, instructions.concat(cleanupInstructions), signers, true);

    notify({
      message: 'Funds borrowed.',
      type: 'success',
      description: `Transaction - ${tx}`,
    });
  } catch (ex) {
    console.error(ex);
    throw new Error();
  }
};