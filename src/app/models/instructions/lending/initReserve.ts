import { PublicKey, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import BN from 'bn.js';
import * as BufferLayout from 'buffer-layout';

import { LENDING_PROGRAM_ID, TOKEN_PROGRAM_ID } from 'utils/ids';
import * as Layout from 'utils/layout';

import { ReserveConfig } from '../../state/lending';
import { LendingInstruction } from './instruction';

/// 2
/// Initializes a new lending market reserve.
///
/// Accounts expected by this instruction:
///
///   0. `[writable]` Source liquidity token account.
///                     $authority can transfer $liquidity_amount.
///   1. `[writable]` Destination collateral token account - uninitialized.
///   2. `[writable]` Reserve account - uninitialized.
///   3. `[]` Reserve liquidity SPL Token mint.
///   4. `[writable]` Reserve liquidity supply SPL Token account - uninitialized.
///   5. `[writable]` Reserve liquidity fee receiver - uninitialized.
///   6. `[]` Pyth product account.
///   7. `[]` Pyth price account.
///             This will be used as the reserve liquidity oracle account.
///   8. `[writable]` Reserve collateral SPL Token mint - uninitialized.
///   9. `[writable]` Reserve collateral token supply - uninitialized.
///   10 `[]` Lending market account.
///   11 `[]` Derived lending market authority.
///   12 `[signer]` Lending market owner.
///   13 `[signer]` User transfer authority ($authority).
///   14 `[]` Clock sysvar.
///   15 `[]` Rent sysvar.
///   16 `[]` Token program id.
///
/// InitReserve {
///     /// Initial amount of liquidity to deposit into the new reserve
///     liquidity_amount: u64,
///     /// Reserve configuration values
///     config: ReserveConfig,
/// },
export const initReserveInstruction = (
  liquidityAmount: number | BN,
  config: ReserveConfig,
  sourceLiquidity: PublicKey,
  destinationCollateral: PublicKey,
  reserve: PublicKey,
  liquidityMint: PublicKey,
  liquiditySupply: PublicKey,
  liquidityFeeReceiver: PublicKey,
  pythProduct: PublicKey,
  pythPrice: PublicKey,
  collateralMint: PublicKey,
  collateralSupply: PublicKey,
  lendingMarket: PublicKey,
  lendingMarketAuthority: PublicKey,
  lendingMarketOwner: PublicKey,
  transferAuthority: PublicKey
): TransactionInstruction => {
  const dataLayout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    Layout.uint64('liquidityAmount'),
    BufferLayout.u8('optimalUtilizationRate'),
    BufferLayout.u8('loanToValueRatio'),
    BufferLayout.u8('liquidationBonus'),
    BufferLayout.u8('liquidationThreshold'),
    BufferLayout.u8('minBorrowRate'),
    BufferLayout.u8('optimalBorrowRate'),
    BufferLayout.u8('maxBorrowRate'),
    Layout.uint64('borrowFeeWad'),
    BufferLayout.u8('hostFeePercentage'),
  ]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: LendingInstruction.InitReserve,
      liquidityAmount: new BN(liquidityAmount),
      optimalUtilizationRate: config.optimalUtilizationRate,
      loanToValueRatio: config.loanToValueRatio,
      liquidationBonus: config.liquidationBonus,
      liquidationThreshold: config.liquidationThreshold,
      minBorrowRate: config.minBorrowRate,
      optimalBorrowRate: config.optimalBorrowRate,
      maxBorrowRate: config.maxBorrowRate,
      borrowFeeWad: config.fees.borrowFeeWad,
      hostFeePercentage: config.fees.hostFeePercentage,
    },
    data
  );

  const keys = [
    { pubkey: sourceLiquidity, isSigner: false, isWritable: true },
    { pubkey: destinationCollateral, isSigner: false, isWritable: true },
    { pubkey: reserve, isSigner: false, isWritable: true },
    { pubkey: liquidityMint, isSigner: false, isWritable: false },
    { pubkey: liquiditySupply, isSigner: false, isWritable: true },
    { pubkey: liquidityFeeReceiver, isSigner: false, isWritable: true },
    { pubkey: pythProduct, isSigner: false, isWritable: false },
    { pubkey: pythPrice, isSigner: false, isWritable: false },
    { pubkey: collateralMint, isSigner: false, isWritable: true },
    { pubkey: collateralSupply, isSigner: false, isWritable: true },
    { pubkey: lendingMarket, isSigner: false, isWritable: true },
    { pubkey: lendingMarketAuthority, isSigner: false, isWritable: false },
    { pubkey: transferAuthority, isSigner: true, isWritable: false },
    { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: LENDING_PROGRAM_ID,
    data,
  });
};
