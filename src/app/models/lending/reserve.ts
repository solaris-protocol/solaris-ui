import { AccountInfo, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import * as BufferLayout from 'buffer-layout';

import * as Layout from 'utils/layout';
import { wadToLamports } from 'utils/utils';

// Instructions Params
export interface depositReserveLiquidityParams {
  liquidityAmount: number;
  sourceLiquidityPubkey: PublicKey;
  destinationCollateralPubkey: PublicKey;
  reservePubkey: PublicKey;
  reserveLiquiditySupplyPubkey: PublicKey;
  reserveCollateralMintPubkey: PublicKey;
  lendingMarketPubkey: PublicKey;
  lendingMarketDerivedAuthorityPubkey: PublicKey;
  userTransferAuthorityPubkey: PublicKey;
  pythPricePubkey: PublicKey;
}

export interface redeemReserveCollateralParams {
  collateralAmount: number;
  sourceCollateralPubkey: PublicKey;
  destinationLiquidityPubkey: PublicKey;
  reservePubkey: PublicKey;
  reserveCollateralMintPubkey: PublicKey;
  reserveLiquiditySupplyPubkey: PublicKey;
  lendingMarketPubkey: PublicKey;
  lendingMarketDerivedAuthorityPubkey: PublicKey;
  userTransferAuthorityPubkey: PublicKey;
  pythPricePubkey: PublicKey;
}

// Reserve
type Decimal = BN;

export interface LastUpdate {
  /// Last slot when updated
  slot: BN;
  /// True when marked stale, false when slot updated
  stale: boolean;
}

export interface ReserveLiquidity {
  /// Reserve liquidity mint address
  mintPubkey: PublicKey;
  /// Reserve liquidity mint decimals
  mintDecimals: number;
  /// Reserve liquidity supply address
  supplyPubkey: PublicKey;
  /// Reserve liquidity fee receiver address
  feeReceiver: PublicKey;
  /// Reserve liquidity oracle account
  oraclePubkey: PublicKey;
  /// Reserve liquidity available
  availableAmount: BN;
  /// Reserve liquidity borrowed
  borrowedAmountWads: Decimal;
  /// Reserve liquidity cumulative borrow rate
  cumulativeBorrowRateWads: Decimal;
  // @TODO: make Decimal
  /// Reserve liquidity market price in quote currency
  marketPrice: BN;
}

export interface ReserveCollateral {
  /// Reserve collateral mint address
  mintPubkey: PublicKey;
  /// Reserve collateral mint supply, used for exchange rate
  mintTotalSupply: BN;
  /// Reserve collateral supply address
  supplyPubkey: PublicKey;
}

export interface ReserveFees {
  /// Fee assessed on borrow, expressed as a Wad.
  /// Must be between 0 and 10^18, such that 10^18 = 1.  A few examples for
  /// clarity:
  /// 1% = 10_000_000_000_000_000
  /// 0.01% (1 basis point) = 100_000_000_000_000
  /// 0.00001% (Aave borrow fee) = 100_000_000_000
  borrowFeeWad: BN;
  /// Fee for flash loan, expressed as a Wad.
  flashLoanFeeWad: BN;
  /// Amount of fee going to host account
  hostFeePercentage: number;
}

export interface ReserveConfig {
  /// Optimal utilization rate, as a percentage
  optimalUtilizationRate: number;
  /// Target ratio of the value of borrows to deposits, as a percentage
  /// 0 if use as collateral is disabled
  loanToValueRatio: number;
  /// Bonus a liquidator gets when repaying part of an unhealthy obligation, as a percentage
  liquidationBonus: number;
  /// Loan to value ratio at which an obligation can be liquidated, as a percentage
  liquidationThreshold: number;
  /// Min borrow APY
  minBorrowRate: number;
  /// Optimal (utilization) borrow APY
  optimalBorrowRate: number;
  /// Max borrow APY
  maxBorrowRate: number;
  /// Program owner fees assessed, separate from gains due to interest accrual
  fees: ReserveFees;
}

export interface Reserve {
  /// Version of the struct
  version: number;
  /// Last slot when supply and rates updated
  last_update: LastUpdate;
  /// Lending market address
  lendingMarket: PublicKey;
  /// Reserve liquidity
  liquidity: ReserveLiquidity;
  /// Reserve collateral
  collateral: ReserveCollateral;
  /// Reserve configuration values
  config: ReserveConfig;
}

export const ReserveLayout: typeof BufferLayout.Structure = BufferLayout.struct([
  BufferLayout.u8('version'),
  BufferLayout.struct([Layout.uint64('slot'), BufferLayout.u8('stale')], 'last_update'),

  Layout.publicKey('lendingMarket'),

  BufferLayout.struct(
    [
      Layout.publicKey('mintPubkey'),
      BufferLayout.u8('mintDecimals'),
      Layout.publicKey('supplyPubkey'),
      Layout.publicKey('feeReceiver'),
      Layout.publicKey('oraclePubkey'),
      Layout.uint64('availableAmount'),
      Layout.uint128('borrowedAmountWads'),
      Layout.uint128('cumulativeBorrowRateWads'),
      Layout.uint64('marketPrice'),
    ],
    'liquidity'
  ),

  BufferLayout.struct(
    [Layout.publicKey('mintPubkey'), Layout.uint64('mintTotalSupply'), Layout.publicKey('supplyPubkey')],
    'collateral'
  ),

  BufferLayout.struct(
    [
      BufferLayout.u8('optimalUtilizationRate'),
      BufferLayout.u8('loanToValueRatio'),
      BufferLayout.u8('liquidationBonus'),
      BufferLayout.u8('liquidationThreshold'),
      BufferLayout.u8('minBorrowRate'),
      BufferLayout.u8('optimalBorrowRate'),
      BufferLayout.u8('maxBorrowRate'),

      BufferLayout.struct(
        [Layout.uint64('borrowFeeWad'), Layout.uint64('flashLoanFeeWad'), BufferLayout.u8('hostFeePercentage')],
        'fees'
      ),
    ],
    'config'
  ),
  // extra space for future contract changes
  BufferLayout.blob(248, 'padding'),
]);

export const isLendingReserve = (info: AccountInfo<Buffer>) => {
  return info.data.length === ReserveLayout.span;
};

export const ReserveParser = (pubKey: PublicKey, info: AccountInfo<Buffer>) => {
  const buffer = Buffer.from(info.data);
  const data = ReserveLayout.decode(buffer) as Reserve;

  // TODO: is it needed?
  if (data.last_update.slot.toNumber() === 0) {
    return;
  }

  const details = {
    pubkey: pubKey,
    account: {
      ...info,
    },
    info: data,
  };

  return details;
};

export const calculateUtilizationRatio = (reserve: Reserve) => {
  const totalBorrows = wadToLamports(reserve.liquidity.borrowedAmountWads).toNumber();
  const currentUtilization = totalBorrows / (reserve.liquidity.availableAmount.toNumber() + totalBorrows);

  return currentUtilization;
};

export const reserveMarketCap = (reserve?: Reserve) => {
  const available = reserve?.liquidity.availableAmount.toNumber() || 0;
  const borrowed = wadToLamports(reserve?.liquidity.borrowedAmountWads).toNumber();
  const total = available + borrowed;

  return total;
};

export const collateralExchangeRate = (reserve?: Reserve) => {
  return (reserve?.collateral.mintTotalSupply.toNumber() || 1) / reserveMarketCap(reserve);
};

export const collateralToLiquidity = (collateralAmount: BN | number, reserve?: Reserve) => {
  const amount = typeof collateralAmount === 'number' ? collateralAmount : collateralAmount.toNumber();
  return Math.floor(amount / collateralExchangeRate(reserve));
};

export const liquidityToCollateral = (liquidityAmount: BN | number, reserve?: Reserve) => {
  const amount = typeof liquidityAmount === 'number' ? liquidityAmount : liquidityAmount.toNumber();
  return Math.floor(amount * collateralExchangeRate(reserve));
};
