import { useMemo } from 'react';

import { PublicKey } from '@solana/web3.js';

import { usePrice } from 'app/contexts/pyth';
import { useReserve, useUserDeposits, useUserObligations } from 'hooks';

// TODO: add option to decrease buying power by overcollateralization factor
// TODO: add support for balance in the wallet
export function useBorrowingPower(
  reserveAddress: string | PublicKey | undefined,
  includeWallet = false,
  overcollateralize = true
) {
  const key = useMemo(
    () => (typeof reserveAddress === 'string' ? reserveAddress : reserveAddress?.toBase58() || ''),
    [reserveAddress]
  );

  const reserve = useReserve(key);

  const liquidityMint = reserve?.info.liquidity.mintPubkey;
  const liquidityMintAddress = liquidityMint?.toBase58();

  const { totalInQuote } = useUserDeposits();

  const price = usePrice(liquidityMintAddress);

  const { totalDepositedValue: loansValue } = useUserObligations();

  const totalDeposits = loansValue + totalInQuote;

  const utilization = totalDeposits === 0 ? 0 : loansValue / totalDeposits;

  return {
    borrowingPower: totalInQuote / price,
    totalInQuote,
    utilization,
  };
}
