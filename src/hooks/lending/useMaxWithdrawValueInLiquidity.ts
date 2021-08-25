import { useMemo } from 'react';

import BN from 'bn.js';

import { ParsedAccount } from 'app/contexts/accounts/accounts';
import { Obligation, Reserve } from 'app/models';
import { wadToLamports } from 'utils/utils';

// Calculate the maximum value that can be withdrawn
export function useMaxWithdrawValueInLiquidity(
  reserve: ParsedAccount<Reserve>,
  obligation?: ParsedAccount<Obligation>
) {
  const maxWithdrawValueInLiquidity = useMemo(() => {
    if (!obligation) {
      return 0;
    }

    // max_withdraw_value
    // https://github.com/solana-labs/solana-program-library/blob/0b3552b8926a9e4b37074a3d19d06591d47ed50a/token-lending/program/src/state/obligation.rs#L94

    const depositedValue = obligation.info.depositedValue; /* obligation.info.deposits.reduce((prev, curr) => {
      return prev.add(curr.marketValue);
    }, new BN(0)); */

    let requiredDepositValue = new BN(0);
    if (!obligation.info.allowedBorrowValue.isZero()) {
      requiredDepositValue = obligation.info.borrowedValue.mul(depositedValue).div(obligation.info.allowedBorrowValue);
    }

    if (requiredDepositValue.gte(depositedValue)) {
      return 0;
    }

    const maxWithdrawValue = depositedValue.sub(requiredDepositValue);
    return wadToLamports(maxWithdrawValue).toNumber() / reserve.info.liquidity.marketPrice.toNumber();
  }, [obligation, reserve]);

  return maxWithdrawValueInLiquidity;
}
