import { AccountInfo as TokenAccountInfo, Token, u64 } from '@solana/spl-token';
import { Account, AccountInfo, PublicKey, TransactionInstruction } from '@solana/web3.js';

import { TOKEN_PROGRAM_ID } from 'utils/ids';

export interface TokenAccount {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
  info: TokenAccountInfo;
}

export function approve(
  instructions: TransactionInstruction[],
  cleanupInstructions: TransactionInstruction[],
  account: PublicKey,
  owner: PublicKey,
  amount: number | u64,
  autoRevoke = true,

  // if delegate is not passed ephemeral transfer authority is used
  delegate?: PublicKey
): Account {
  const tokenProgram = TOKEN_PROGRAM_ID;
  const transferAuthority = new Account();

  // Coerce amount to u64 in case it's deserialized as BN which differs by buffer conversion functions only
  // Without the coercion createApproveInstruction would fail because it won't be able to serialize it
  if (typeof amount !== 'number') {
    amount = new u64(amount.toArray());
  }

  instructions.push(
    Token.createApproveInstruction(tokenProgram, account, delegate ?? transferAuthority.publicKey, owner, [], amount)
  );

  if (autoRevoke) {
    cleanupInstructions.push(Token.createRevokeInstruction(tokenProgram, account, owner, []));
  }

  return transferAuthority;
}
