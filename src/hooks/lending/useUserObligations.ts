import { useMemo } from 'react';

import { useWallet } from 'app/contexts/wallet';

import { useEnrichedLendingObligations } from './useEnrichedLendingObligations';

export function useUserObligations() {
  const { wallet } = useWallet();
  const { obligations } = useEnrichedLendingObligations();

  const userObligations = useMemo(() => {
    if (!wallet?.publicKey) {
      return [];
    }

    return obligations
      .filter((acc) => wallet.publicKey?.equals(acc.info.owner))
      .sort((a, b) =>
        b.info.unhealthyBorrowValue
          .sub(b.info.borrowedValue)
          .sub(a.info.unhealthyBorrowValue.sub(a.info.borrowedValue))
          .toNumber()
      );
  }, [obligations]);

  return {
    userObligations,
    collateralInQuote: userObligations.reduce((result, obligation) => result + obligation.info.collateralInQuote, 0),
    borrowedInQuote: userObligations.reduce((result, obligation) => result + obligation.info.borrowedInQuote, 0),
  };
}
