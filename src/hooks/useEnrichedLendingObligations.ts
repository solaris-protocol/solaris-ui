import { useCallback, useEffect, useMemo, useState } from 'react';

import { MintInfo } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import { cache, ParsedAccount } from 'app/contexts/accounts';
import { useConnectionConfig } from 'app/contexts/connection';
import { simulateMarketOrderFill, useMarkets } from 'app/contexts/market';
import { collateralToLiquidity, LendingObligation, Reserve } from 'app/models/lending';
import { fromLamports, getTokenName, wadToLamports } from 'utils/utils';

import { useLendingObligations } from './useLendingObligations';
import { useLendingReserves } from './useLendingReserves';

interface EnrichedLendingObligationInfo extends LendingObligation {
  ltv: number;
  health: number;
  borrowedInQuote: number;
  collateralInQuote: number;
  liquidationThreshold: number;
  repayName: string;
  collateralName: string;
}

export interface EnrichedLendingObligation {
  account: ParsedAccount<LendingObligation>;
  info: EnrichedLendingObligationInfo;
}

export function useEnrichedLendingObligations() {
  const { obligations } = useLendingObligations();
  const { reserveAccounts } = useLendingReserves();
  const { tokenMap } = useConnectionConfig();
  const { marketEmitter, midPriceInUSD } = useMarkets();

  const availableReserves = useMemo(() => {
    return reserveAccounts.reduce((map, reserve) => {
      map.set(reserve.pubkey.toBase58(), reserve);
      return map;
    }, new Map<string, ParsedAccount<Reserve>>());
  }, [reserveAccounts]);

  const enrichedFactory = useCallback(() => {
    if (availableReserves.size === 0) {
      return [];
    }

    return (
      obligations
        .map((obligation) => ({
          obligation,
          reserve: availableReserves.get(obligation.info.borrowReserve.toBase58()) as ParsedAccount<Reserve>,
          collateralReserve: availableReserves.get(
            obligation.info.collateralReserve.toBase58()
          ) as ParsedAccount<Reserve>,
        }))
        // use obligations with reserves available
        .filter((item) => item.reserve)
        // use reserves with borrow amount greater than zero
        .filter((item) => wadToLamports(item.obligation.info.borrowAmountWad).toNumber() > 0)
        .map((item) => {
          const obligation = item.obligation;
          const reserve = item.reserve.info;
          const collateralReserve = item.reserve.info;
          const liquidityMint = cache.get(reserve.liquidity.mintPubkey) as ParsedAccount<MintInfo>;
          let ltv = 0;
          let health = 0;
          let borrowedInQuote = 0;
          let collateralInQuote = 0;

          if (liquidityMint) {
            const collateralMint = cache.get(item.collateralReserve.info.liquidity.mintPubkey);

            const collateral = fromLamports(
              collateralToLiquidity(obligation.info.depositedCollateral, item.reserve.info),
              collateralMint?.info
            );

            const borrowed = wadToLamports(obligation.info.borrowAmountWad).toNumber();

            const borrowedAmount = simulateMarketOrderFill(
              borrowed,
              item.reserve.info,
              // @ts-ignore
              item.reserve.info.dexMarketOption ? item.reserve.info.dexMarket : item.collateralReserve.info.dexMarket,
              true
            );

            const liquidityMintAddress = item.reserve.info.liquidity.mintPubkey.toBase58();
            const liquidityMint = cache.get(liquidityMintAddress) as ParsedAccount<MintInfo>;
            borrowedInQuote = fromLamports(borrowed, liquidityMint.info) * midPriceInUSD(liquidityMintAddress);
            collateralInQuote = collateral * midPriceInUSD(collateralMint?.pubkey.toBase58() || '');

            ltv = (100 * borrowedAmount) / collateral;

            const liquidationThreshold = item.reserve.info.config.liquidationThreshold;
            health = (collateral * liquidationThreshold) / 100 / borrowedAmount;
          }

          return {
            account: obligation,
            info: {
              ...obligation.info,
              ltv,
              health,
              borrowedInQuote,
              collateralInQuote,
              liquidationThreshold: item.reserve.info.config.liquidationThreshold,
              repayName: getTokenName(tokenMap, reserve.liquidity.mintPubkey),
              collateralName: getTokenName(tokenMap, collateralReserve.liquidity.mintPubkey),
            },
          } as EnrichedLendingObligation;
        })
        .sort((a, b) => a.info.health - b.info.health)
    );
  }, [obligations, availableReserves, midPriceInUSD, tokenMap]);

  const [enriched, setEnriched] = useState<EnrichedLendingObligation[]>(enrichedFactory());

  useEffect(() => {
    const dispose = marketEmitter.onMarket(() => {
      setEnriched(enrichedFactory());
    });

    return () => {
      dispose();
    };
  }, [enrichedFactory, setEnriched, marketEmitter, midPriceInUSD]);

  return {
    obligations: enriched,
  };
}

export function useEnrichedLendingObligation(address?: string | PublicKey) {
  const id = typeof address === 'string' ? address : address?.toBase58();
  const { obligations } = useEnrichedLendingObligations();

  const obligation = useMemo(() => {
    return obligations.find((ob) => ob.account.pubkey.toBase58() === id);
  }, [obligations, id]);

  return obligation;
}