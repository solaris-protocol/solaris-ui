export enum LendingInstructions {
  InitLendingMarket = 0,
  SetLendingMarketOwner = 1,
  InitReserve = 2,
  RefreshReserve = 3,
  DepositReserveLiquidity = 4,
  RedeemReserveCollateral = 5,
  InitObligation = 6,
  RefreshObligation = 7,
  DepositObligationCollateral = 8,
  WithdrawObligationCollateral = 9,
  BorrowObligationLiquidity = 10,
  RepayObligationLiquidity = 11,
  LiquidateObligation = 12,
  FlashLoan = 13,
}

export const TransactionListLookup: { [key: number]: string } = {
  3: 'Deposit',
  4: 'Withdraw',
  5: 'Borrow',
  6: 'Repay',
  7: 'Liquidate',
};
