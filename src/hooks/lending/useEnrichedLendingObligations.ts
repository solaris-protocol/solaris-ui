import { useCallback, useEffect, useMemo, useState } from 'react';

import { MintInfo } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import { cache, ParsedAccount } from 'app/contexts/accounts';
import { useConnectionConfig } from 'app/contexts/connection/connection';
import { usePyth } from 'app/contexts/pyth';
import { collateralToLiquidity, Obligation, Reserve } from 'app/models';
import { fromLamports, getTokenName, wadToLamports } from 'utils/utils';

import { useLendingObligations } from './useLendingObligations';
import { useLendingReserves } from './useLendingReserves';

interface EnrichedLendingObligationInfo extends Obligation {
  ltv: number;
  health: number;
  borrowedInQuote: number;
  collateralInQuote: number;
  liquidationThreshold: number;
  repayName: string;
  collateralName: string;
}

// @TODO: rework
export interface EnrichedLendingObligation {
  account: ParsedAccount<Obligation>;
  info: EnrichedLendingObligationInfo;
}

export function useEnrichedLendingObligations() {
  const { obligations } = useLendingObligations();
  const { reserveAccounts } = useLendingReserves();
  const { tokenMap } = useConnectionConfig();
  const { getPrice } = usePyth();

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

    return obligations.map((obligation) => ({
      account: obligation,
      info: {
        ...obligation.info,
      },
    }));
    // .map((obligation) => ({
    //   obligation,
    //   reserve: availableReserves.get(obligation.info.borrows[0].borrowReserve.toBase58()) as ParsedAccount<Reserve>,
    //   depositReserve: availableReserves.get(
    //     obligation.info.deposits[0].depositReserve.toBase58()
    //   ) as ParsedAccount<Reserve>,
    // }))
    // // use obligations with reserves available
    // .filter((item) => item.reserve)
    // // use reserves with borrow amount greater than zero
    // .filter((item) => wadToLamports(item.obligation.info.borrows[0].borrowedAmountWads).toNumber() > 0)
    // .map((item) => {
    //   const obligation = item.obligation;
    //   const reserve = item.reserve.info;
    //   const depositReserve = item.reserve.info;
    //   const liquidityMint = cache.get(reserve.liquidity.mintPubkey) as ParsedAccount<MintInfo>;
    //   let ltv = 0;
    //   let health = 0;
    //   let borrowedInQuote = 0;
    //   let collateralInQuote = 0;
    //
    //   if (liquidityMint) {
    //     const collateralMint = cache.get(item.depositReserve.info.liquidity.mintPubkey);
    //
    //     const collateral = fromLamports(
    //       collateralToLiquidity(obligation.info.deposits[0].depositedAmount, item.reserve.info),
    //       collateralMint?.info
    //     );
    //
    //     // @FIXME: support multiple borrows
    //     const borrowed = wadToLamports(obligation.info.borrows[0].borrowedAmountWads).toNumber();
    //
    //     // @FIXME: remove dex market
    //     const borrowedAmount = borrowed;
    //
    //     const liquidityMintAddress = item.reserve.info.liquidity.mintPubkey.toBase58();
    //     const liquidityMint = cache.get(liquidityMintAddress) as ParsedAccount<MintInfo>;
    //     borrowedInQuote = fromLamports(borrowed, liquidityMint.info) * getPrice(liquidityMintAddress);
    //     // @FIXME: collateral can't be priced by pyth
    //     collateralInQuote = collateral * getPrice(collateralMint?.pubkey.toBase58() || '');
    //
    //     ltv = (100 * borrowedAmount) / collateral;
    //
    //     const liquidationThreshold = item.reserve.info.config.liquidationThreshold;
    //     health = (collateral * liquidationThreshold) / 100 / borrowedAmount;
    //   }
    //
    //   return {
    //     account: obligation,
    //     info: {
    //       ...obligation.info,
    //       ltv,
    //       health,
    //       borrowedInQuote,
    //       collateralInQuote,
    //       liquidationThreshold: item.reserve.info.config.liquidationThreshold,
    //       repayName: getTokenName(tokenMap, reserve.liquidity.mintPubkey),
    //       collateralName: getTokenName(tokenMap, depositReserve.liquidity.mintPubkey),
    //     },
    //   } as EnrichedLendingObligation;
    // })
    // .sort((a, b) => a.info.health - b.info.health)
  }, [obligations, availableReserves, getPrice, tokenMap]);

  const [enriched, setEnriched] = useState<EnrichedLendingObligation[]>(enrichedFactory());

  useEffect(() => {
    setEnriched(enrichedFactory());
  }, [enrichedFactory, setEnriched]);

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
