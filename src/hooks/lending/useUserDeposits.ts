import { useEffect, useMemo, useState } from 'react';

import { MintInfo } from '@solana/spl-token';

import { cache, ParsedAccount } from 'app/contexts/accounts';
import { usePyth } from 'app/contexts/pyth';
import { useTokenListContext } from 'app/contexts/tokenList';
import { calculateDepositAPY, Reserve, TokenAccount } from 'app/models';
import { useReserves } from 'hooks';
import { fromLamports, getTokenSymbol } from 'utils/utils';

import { useUserAccounts } from '../system/useUserAccounts';
import { calculateCollateralBalance } from './useCollateralBalance';

export interface UserDeposit {
  account: TokenAccount;
  info: {
    amount: number;
    amountInQuote: number;
    apy: number;
    name: string;
    precision: number;
  };
  reserve: ParsedAccount<Reserve>;
}

export function useUserDeposits(exclude?: Set<string>, include?: Set<string>) {
  const { userAccounts } = useUserAccounts();
  const { reserveAccounts } = useReserves();
  const [userDeposits, setUserDeposits] = useState<UserDeposit[]>([]);
  const { getPrice } = usePyth();
  const { tokenMap } = useTokenListContext();

  const reservesByCollateralMint = useMemo(() => {
    return reserveAccounts.reduce((result, item) => {
      const id = item.pubkey.toBase58();
      if (exclude && exclude.has(id)) {
        return result;
      }

      if (!include || include.has(id)) {
        result.set(item.info.collateral.mintPubkey.toBase58(), item);
      }

      return result;
    }, new Map<string, ParsedAccount<Reserve>>());
  }, [reserveAccounts, exclude, include]);

  useEffect(() => {
    const userDepositsFactory = () => {
      return userAccounts
        .filter((acc) => reservesByCollateralMint.has(acc?.info.mint.toBase58()))
        .map((item) => {
          const reserve = reservesByCollateralMint.get(item?.info.mint.toBase58()) as ParsedAccount<Reserve>;

          const collateralMint = cache.get(reserve.info.collateral.mintPubkey) as ParsedAccount<MintInfo>;

          const amountLamports = calculateCollateralBalance(reserve.info, item?.info.amount.toNumber());
          const amount = fromLamports(amountLamports, collateralMint?.info);
          const price = getPrice(reserve.info.liquidity.mintPubkey.toBase58());
          const amountInQuote = price * amount;

          return {
            account: item,
            info: {
              amount,
              amountInQuote,
              apy: calculateDepositAPY(reserve.info),
              name: getTokenSymbol(tokenMap, reserve.info.liquidity.mintPubkey),
            },
            reserve,
          } as UserDeposit;
        })
        .sort((a, b) => b.info.amountInQuote - a.info.amountInQuote);
    };

    setUserDeposits(userDepositsFactory());
  }, [userAccounts, reserveAccounts, reservesByCollateralMint, tokenMap, getPrice]);

  return {
    userDeposits,
    totalInQuote: userDeposits.reduce((res, item) => res + item.info.amountInQuote, 0),
  };
}
