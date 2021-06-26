import { useMemo } from 'react';

import { PublicKey } from '@solana/web3.js';

import { ObligationCollateral, ObligationLiquidity } from 'app/models';

import { useUserObligations } from './useUserObligations';

export function useUserObligationByReserve(borrowReserve?: string | PublicKey, depositReserve?: string | PublicKey) {
  const { userObligations } = useUserObligations();

  const userObligationsByReserve = useMemo(() => {
    const borrowReservePubkey = typeof borrowReserve === 'string' ? borrowReserve : borrowReserve?.toBase58();
    const depositReservePubkey = typeof depositReserve === 'string' ? depositReserve : depositReserve?.toBase58();

    return userObligations.filter((obligation) => {
      if (borrowReservePubkey && depositReservePubkey) {
        return (
          obligation.info.borrows.some(
            (liquidity: ObligationLiquidity) => liquidity.borrowReserve.toBase58() === borrowReservePubkey
          ) &&
          obligation.info.deposits.some(
            (collateral: ObligationCollateral) => collateral.depositReserve.toBase58() === depositReservePubkey
          )
        );
      }

      if (borrowReservePubkey) {
        return obligation.info.borrows.some(
          (liquidity: ObligationLiquidity) => liquidity.borrowReserve.toBase58() === borrowReservePubkey
        );
      }

      if (depositReservePubkey) {
        return obligation.info.deposits.some(
          (collateral: ObligationCollateral) => collateral.depositReserve.toBase58() === depositReservePubkey
        );
      }

      return false;
    });
  }, [borrowReserve, depositReserve, userObligations]);

  return {
    userObligationsByReserve,
  };
}
