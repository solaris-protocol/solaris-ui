import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import * as BufferLayout from 'buffer-layout';

import { LENDING_PROGRAM_ID } from 'utils/ids';
import * as Layout from 'utils/layout';

import { LendingInstruction } from './instruction';

/// 1
/// Sets the new owner of a lending market.
///
/// Accounts expected by this instruction:
///
///   0. `[writable]` Lending market account.
///   1. `[signer]` Current owner.
///
/// SetLendingMarketOwner {
///   /// The new owner
///   new_owner: Pubkey,
/// },
export const setLendingMarketOwnerInstruction = (
  newOwner: PublicKey,
  lendingMarket: PublicKey,
  currentOwner: PublicKey
): TransactionInstruction => {
  const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction'), Layout.publicKey('newOwner')]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: LendingInstruction.SetLendingMarketOwner,
      newOwner,
    },
    data
  );

  const keys = [
    { pubkey: lendingMarket, isSigner: false, isWritable: true },
    { pubkey: currentOwner, isSigner: true, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: LENDING_PROGRAM_ID,
    data,
  });
};
