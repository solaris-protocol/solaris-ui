import { AccountLayout, MintInfo } from '@solana/spl-token';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Account, Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';

import { refreshObligationAndReserves } from 'app/actions/helpers/refreshObligationAndReserves';
import { cache, ParsedAccount } from 'app/contexts/accounts';
import { sendTransaction } from 'app/contexts/connection';
import { borrowObligationLiquidityInstruction, MintParser, Obligation, ObligationParser, Reserve } from 'app/models';
import { LEND_HOST_FEE_ADDRESS, LENDING_PROGRAM_ID } from 'utils/ids';
import { notify } from 'utils/notifications';
import { toLamports } from 'utils/utils';

import { findOrCreateAccountByMint } from './account';

export const borrow = async (
  connection: Connection,
  wallet: WalletContextState,
  liquidityAmount: number,
  borrowReserve: ParsedAccount<Reserve>,
  obligation: ParsedAccount<Obligation>
) => {
  if (!wallet.publicKey) {
    throw new Error('Wallet is not connected');
  }

  notify({
    message: 'Borrowing funds...',
    description: 'Please review transactions to approve.',
    type: 'warn',
  });

  const signers: Account[] = [];
  const instructions: TransactionInstruction[] = [];
  const cleanupInstructions: TransactionInstruction[] = [];

  const [lendingMarketAuthority] = await PublicKey.findProgramAddress(
    [borrowReserve.info.lendingMarket.toBuffer()],
    LENDING_PROGRAM_ID
  );

  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

  // Creates host fee account if it doesn't exist
  const hostFeeReceiver = LEND_HOST_FEE_ADDRESS
    ? findOrCreateAccountByMint(
        wallet.publicKey,
        LEND_HOST_FEE_ADDRESS,
        instructions,
        [],
        accountRentExempt,
        borrowReserve.info.liquidity.mintPubkey,
        signers
      )
    : undefined;

  const mint = (await cache.query(
    connection,
    borrowReserve.info.liquidity.mintPubkey,
    MintParser
  )) as ParsedAccount<MintInfo>;

  // @TODO: handle 100% -> u64::MAX
  const amountLamports = toLamports(liquidityAmount, mint?.info);

  const destinationLiquidity = await findOrCreateAccountByMint(
    wallet.publicKey,
    wallet.publicKey,
    instructions,
    cleanupInstructions,
    accountRentExempt,
    borrowReserve.info.liquidity.mintPubkey,
    signers
  );

  /*
    Borrow
   */
  instructions.push(
    ...(await refreshObligationAndReserves(connection, obligation)),
    borrowObligationLiquidityInstruction(
      amountLamports,
      borrowReserve.info.liquidity.supplyPubkey,
      destinationLiquidity,
      borrowReserve.pubkey,
      borrowReserve.info.liquidity.feeReceiver,
      obligation.pubkey,
      borrowReserve.info.lendingMarket,
      lendingMarketAuthority,
      obligation.info.owner,
      hostFeeReceiver
    )
  );

  try {
    const { txid } = await sendTransaction(connection, wallet, instructions.concat(cleanupInstructions), signers, true);

    notify({
      message: 'Funds borrowed.',
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
