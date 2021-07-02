import { AccountInfo, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import * as BufferLayout from 'buffer-layout';

import * as Layout from 'utils/layout';

import { LastUpdate, LastUpdateLayout } from './lastUpdate';

type Decimal = BN;

export interface Obligation {
  /// Version of the struct
  version: number;
  /// Last slot when supply and rates updated
  lastUpdate: LastUpdate;
  /// Lending market address
  lendingMarket: PublicKey;
  /// Owner authority which can borrow liquidity
  owner: PublicKey;
  /// Deposited collateral for the obligation, unique by deposit reserve address
  deposits: Array<ObligationCollateral>;
  /// Borrowed liquidity for the obligation, unique by borrow reserve address
  borrows: Array<ObligationLiquidity>;
  /// Market value of deposits
  depositedValue: Decimal;
  /// Market value of borrows
  borrowedValue: Decimal;
  /// The maximum borrow value at the weighted average loan to value ratio
  allowedBorrowValue: Decimal;
  /// The dangerous borrow value at the weighted average liquidation threshold
  unhealthyBorrowValue: Decimal;
}

export interface ObligationCollateral {
  // Reserve collateral is deposited to
  depositReserve: PublicKey;
  // Amount of collateral deposited
  depositedAmount: BN;
  // Collateral market value in quote currency
  marketValue: Decimal;
}

export interface ObligationLiquidity {
  //Reserve liquidity is borrowed from
  borrowReserve: PublicKey;
  //Borrow rate used for calculating interest
  cumulativeBorrowRateWads: Decimal;
  //Amount of liquidity borrowed plus interest
  borrowedAmountWads: Decimal;
  //Liquidity market value in quote currency
  marketValue: Decimal;
}

export interface ProtoObligation {
  version: number;
  lastUpdate: LastUpdate;
  lendingMarket: PublicKey;
  owner: PublicKey;
  depositedValue: BN; // decimals
  borrowedValue: BN; // decimals
  allowedBorrowValue: BN; // decimals
  unhealthyBorrowValue: BN; // decimals
  depositsLen: number;
  borrowsLen: number;
  dataFlat: Buffer;
}

export const ObligationLayout = BufferLayout.struct<ProtoObligation>([
  BufferLayout.u8('version'),

  LastUpdateLayout,

  Layout.publicKey('lendingMarket'),
  Layout.publicKey('owner'),
  Layout.uint128('depositedValue'),
  Layout.uint128('borrowedValue'),
  Layout.uint128('allowedBorrowValue'),
  Layout.uint128('unhealthyBorrowValue'),

  BufferLayout.u8('depositsLen'),
  BufferLayout.u8('borrowsLen'),
  BufferLayout.blob(776, 'dataFlat'),
]);

export const ObligationCollateralLayout = BufferLayout.struct<ObligationCollateral>([
  Layout.publicKey('depositReserve'),
  Layout.uint64('depositedAmount'),
  Layout.uint128('marketValue'),
]);

export const ObligationLiquidityLayout = BufferLayout.struct<ObligationLiquidity>([
  Layout.publicKey('borrowReserve'),
  Layout.uint128('cumulativeBorrowRateWads'),
  Layout.uint128('borrowedAmountWads'),
  Layout.uint128('marketValue'),
]);

export const isObligation = (info: AccountInfo<Buffer>) => {
  return info.data.length === ObligationLayout.span;
};

export const ObligationParser = (pubkey: PublicKey, info: AccountInfo<Buffer>) => {
  const buffer = Buffer.from(info.data);
  const {
    version,
    lastUpdate,
    lendingMarket,
    owner,
    depositedValue,
    borrowedValue,
    allowedBorrowValue,
    unhealthyBorrowValue,
    depositsLen,
    borrowsLen,
    dataFlat,
  } = ObligationLayout.decode(buffer);

  if (lastUpdate.slot.isZero()) {
    return;
  }

  const depositsSpan = depositsLen * ObligationCollateralLayout.span;
  const borrowsSpan = borrowsLen * ObligationLiquidityLayout.span;

  const depositsBuffer = dataFlat.slice(0, depositsSpan);
  const deposits = BufferLayout.seq(ObligationCollateralLayout, depositsLen).decode(depositsBuffer);

  const borrowsBuffer = dataFlat.slice(depositsSpan, depositsSpan + borrowsSpan);
  const borrows = BufferLayout.seq(ObligationLiquidityLayout, borrowsLen).decode(borrowsBuffer);

  const obligation = {
    version,
    lastUpdate,
    lendingMarket,
    owner,
    depositedValue,
    borrowedValue,
    allowedBorrowValue,
    unhealthyBorrowValue,
    deposits,
    borrows,
  } as Obligation;

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: obligation,
  };

  return details;
};

// @TODO: implement
export const healthFactorToRiskColor = (health: number) => {
  return '';
};
