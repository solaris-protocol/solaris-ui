import { useMemo } from 'react';

import { PublicKey } from '@solana/web3.js';

import { usePrice } from 'app/contexts/pyth';

import { useLendingReserve } from './useLendingReserves';
import { useUserDeposits } from './useUserDeposits';
import { useUserObligations } from './useUserObligations';

// TODO: add option to decrease buying power by overcollateralization factor
// TODO: add support for balance in the wallet
export function useBorrowingPower(reserveAddress: string | PublicKey | undefined) {
  const key = useMemo(
    () => (typeof reserveAddress === 'string' ? reserveAddress : reserveAddress?.toBase58() || ''),
    [reserveAddress]
  );

  const reserve = useLendingReserve(key);

  const liquidityMint = reserve?.info.liquidity.mintPubkey;
  const liquidityMintAddress = liquidityMint?.toBase58();

  const { totalInQuote } = useUserDeposits();

  const price = usePrice(liquidityMintAddress);

  const { borrowedInQuote: loansValue } = useUserObligations();

  const totalDeposits = loansValue + totalInQuote;

  const utilization = totalDeposits === 0 ? 0 : loansValue / totalDeposits;

  return {
    borrowingPower: totalInQuote / price,
    totalInQuote,
    utilization,
  };
}
