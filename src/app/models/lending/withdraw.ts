import { SYSVAR_CLOCK_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import BN from 'bn.js';
import BufferLayout from 'buffer-layout';

import { LENDING_PROGRAM_ID, TOKEN_PROGRAM_ID } from 'utils/ids';
import { uint64 } from 'utils/layout';

import { LendingInstructions } from './lending';
import { redeemReserveCollateralParams } from './reserve';

// 5
/// Redeem collateral from a reserve in exchange for liquidity.
///
/// Accounts expected by this instruction:
///
///   0. `[writable]` Source collateral token account.
///                     $authority can transfer $collateral_amount.
///   1. `[writable]` Destination liquidity token account.
///   2. `[writable]` Reserve account.
///   3. `[writable]` Reserve collateral SPL Token mint.
///   4. `[writable]` Reserve liquidity supply SPL Token account.
///   5. `[]` Lending market account.
///   6. `[]` Derived lending market authority.
///   7. `[signer]` User transfer authority ($authority).
///   8. `[]` Clock sysvar.
///   9. `[]` Token program id.
export const redeemReserveCollateralInstruction = (params: redeemReserveCollateralParams): TransactionInstruction => {
  const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction'), uint64('collateralAmount')]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: LendingInstructions.RedeemReserveCollateral,
      collateralAmount: new BN(params.collateralAmount),
    },
    data
  );

  const keys = [
    {
      pubkey: params.sourceCollateralPubkey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: params.destinationLiquidityPubkey,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: params.reservePubkey, isSigner: false, isWritable: true },
    {
      pubkey: params.reserveCollateralMintPubkey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: params.reserveLiquiditySupplyPubkey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: params.lendingMarketPubkey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: params.lendingMarketDerivedAuthorityPubkey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: params.userTransferAuthorityPubkey,
      isSigner: true,
      isWritable: false,
    },
    { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: LENDING_PROGRAM_ID,
    data,
  });
};
