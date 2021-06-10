import { useEffect, useState } from 'react';

import { cache, ParsedAccount } from 'app/contexts/accounts';
import { Reserve, ReserveParser } from 'app/models';

import { useUserDeposits } from './useUserDeposits';

export const useBalanceByCollateral = (collateralReserve?: string) => {
  const userDeposits = useUserDeposits();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (collateralReserve) {
      const id: string = cache.byParser(ReserveParser).find((acc) => acc === collateralReserve) || '';
      const parser = cache.get(id) as ParsedAccount<Reserve>;

      if (parser) {
        const collateralDeposit = userDeposits.userDeposits.find(
          (u) => u.reserve.info.liquidity.mintPubkey.toBase58() === parser.info.liquidity.mintPubkey.toBase58()
        );

        if (collateralDeposit) {
          setBalance(collateralDeposit.info.amount);
        } else {
          setBalance(0);
        }
      }
    } else {
      setBalance(0);
    }
  }, [collateralReserve, userDeposits.userDeposits]);

  return balance;
};
