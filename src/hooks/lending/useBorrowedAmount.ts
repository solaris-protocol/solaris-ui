import { useEffect, useState } from 'react';

import { PublicKey } from '@solana/web3.js';

import { useMint } from 'app/contexts/accounts';
import { useConnection } from 'app/contexts/connection';
import { fromLamports, wadToLamports } from 'utils/utils';

import { useLendingReserve } from './useLendingReserves';
import { useUserObligationByReserve } from './useUserObligationByReserve';

export function useBorrowedAmount(address?: string | PublicKey) {
  const connection = useConnection();
  const { userObligationsByReserve } = useUserObligationByReserve(address);
  const [borrowedInfo, setBorrowedInfo] = useState({
    borrowedLamports: 0,
    borrowedInUSD: 0,
    colateralInUSD: 0,
    ltv: 0,
    health: 0,
  });
  const reserve = useLendingReserve(address);
  const liquidityMint = useMint(reserve?.info.liquidity.mintPubkey);

  useEffect(() => {
    setBorrowedInfo({
      borrowedLamports: 0,
      borrowedInUSD: 0,
      colateralInUSD: 0,
      ltv: 0,
      health: 0,
    });

    (async () => {
      const result = {
        borrowedLamports: 0,
        borrowedInUSD: 0,
        colateralInUSD: 0,
        ltv: 0,
        health: 0,
      };

      let liquidationThreshold = 0;

      userObligationsByReserve.forEach((obligation) => {
        // @FIXME: support multiple borrows, and decimals may be different than lamports
        const borrowedLamports = wadToLamports(obligation.info.borrows[0].borrowedAmountWads).toNumber();

        // @FIXME: obligation tokens
        result.borrowedLamports += borrowedLamports;
        result.borrowedInUSD += obligation.info.borrowedInQuote;
        result.colateralInUSD += obligation.info.collateralInQuote;
        // @FIXME: BigNumber
        liquidationThreshold = obligation.info.liquidationThreshold;
      }, 0);

      if (userObligationsByReserve.length === 1) {
        result.ltv = userObligationsByReserve[0].info.ltv;
        result.health = userObligationsByReserve[0].info.health;
      } else {
        result.ltv = (100 * result.borrowedInUSD) / result.colateralInUSD;
        result.health = (result.colateralInUSD * liquidationThreshold) / 100 / result.borrowedInUSD;
        result.health = Number.isFinite(result.health) ? result.health : 0;
      }

      setBorrowedInfo(result);
    })();
  }, [connection, userObligationsByReserve, setBorrowedInfo]);

  return {
    borrowed: fromLamports(borrowedInfo.borrowedLamports, liquidityMint),
    ...borrowedInfo,
  };
}
