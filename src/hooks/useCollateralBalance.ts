import { useEffect, useMemo, useState } from 'react';

import { PublicKey } from '@solana/web3.js';

import { useMint } from 'app/contexts/accounts';
import { useMarkets } from 'app/contexts/market';
import { Reserve, reserveMarketCap } from 'app/models/lending';
import { fromLamports } from 'utils/utils';

import { useUserBalance } from './useUserBalance';

export function calculateCollateralBalance(reserve: Reserve, balanceLamports: number) {
  return reserveMarketCap(reserve) * (balanceLamports / (reserve?.collateral.mintTotalSupply.toNumber() || 1));
}

export function useUserCollateralBalance(reserve?: Reserve, account?: PublicKey) {
  const mint = useMint(reserve?.collateral.mintPubkey);
  const { balanceLamports: userBalance, accounts } = useUserBalance(reserve?.collateral.mintPubkey, account);

  const [balanceInUSD, setBalanceInUSD] = useState(0);
  const { marketEmitter, midPriceInUSD } = useMarkets();

  const balanceLamports = useMemo(
    () => reserve && calculateCollateralBalance(reserve, userBalance),
    [userBalance, reserve]
  );

  const balance = useMemo(() => fromLamports(balanceLamports, mint), [balanceLamports, mint]);

  useEffect(() => {
    const updateBalance = () => {
      setBalanceInUSD(balance * midPriceInUSD(reserve?.liquidity.mintPubkey?.toBase58() || ''));
    };

    const dispose = marketEmitter.onMarket(() => {
      updateBalance();
    });

    updateBalance();

    return () => {
      dispose();
    };
  }, [balance, midPriceInUSD, marketEmitter, mint, setBalanceInUSD, reserve]);

  return {
    balance,
    balanceLamports,
    balanceInUSD,
    mint: reserve?.collateral.mintPubkey,
    accounts,
    hasBalance: accounts.length > 0 && balance > 0,
  };
}
