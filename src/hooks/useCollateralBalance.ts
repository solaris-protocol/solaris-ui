import { useEffect, useMemo, useState } from 'react';

import { PublicKey } from '@solana/web3.js';

import { useMint } from 'app/contexts/accounts';
import { usePyth } from 'app/contexts/pyth';
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
  const { priceEmitter, midPriceInUSD } = usePyth();

  const balanceLamports = useMemo(
    () => reserve && calculateCollateralBalance(reserve, userBalance),
    [userBalance, reserve]
  );

  const balance = useMemo(() => fromLamports(balanceLamports, mint), [balanceLamports, mint]);

  useEffect(() => {
    const updateBalance = () => {
      setBalanceInUSD(balance * midPriceInUSD(reserve?.liquidity.oraclePubkey?.toBase58() || ''));
    };

    const dispose = priceEmitter.onPrice((args) => {
      if (args.id === reserve?.liquidity.oraclePubkey.toBase58()) {
        updateBalance();
      }
    });

    updateBalance();

    return () => {
      dispose();
    };
  }, [balance, midPriceInUSD, priceEmitter, mint, setBalanceInUSD, reserve]);

  return {
    balance,
    balanceLamports,
    balanceInUSD,
    mint: reserve?.collateral.mintPubkey,
    accounts,
    hasBalance: accounts.length > 0 && balance > 0,
  };
}
