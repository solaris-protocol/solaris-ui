import { useMemo } from 'react';

import { ParsedAccount } from 'app/contexts/accounts/accounts';
import { Obligation, Reserve } from 'app/models';
import { wadToLamports } from 'utils/utils';

// Calculate the maximum liquidity value that can be borrowed
export function useMaxBorrowValueInLiquidity(reserve: ParsedAccount<Reserve>, obligation?: ParsedAccount<Obligation>) {
  const maxBorrowValueInLiquidity = useMemo(() => {
    if (!obligation) {
      return 0;
    }

    // remaining_borrow_value
    // https://github.com/solana-labs/solana-program-library/blob/0b3552b8926a9e4b37074a3d19d06591d47ed50a/token-lending/program/src/state/obligation.rs#L106
    const remainingBorrowValue = obligation?.info.allowedBorrowValue.sub(obligation?.info.borrowedValue);

    return wadToLamports(remainingBorrowValue).toNumber() / reserve.info.liquidity.marketPrice.toNumber();
  }, [obligation, reserve.info.liquidity.marketPrice]);

  return maxBorrowValueInLiquidity;
}
