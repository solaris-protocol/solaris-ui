import { useEffect, useState } from 'react';

import { PublicKey } from '@solana/web3.js';

import { cache, ParsedAccount } from 'app/contexts/accounts';
import { useConnection } from 'app/contexts/connection';
import { LendingMarket, LendingMarketParser } from 'app/models';

const getLendingMarkets = () => {
  return cache
    .byParser(LendingMarketParser)
    .map((id) => cache.get(id))
    .filter((acc) => acc !== undefined) as any[];
};

export function useLendingMarkets() {
  const [lendingMarkets, setLendingMarkets] = useState<ParsedAccount<LendingMarket>[]>(getLendingMarkets());

  useEffect(() => {
    const dispose = cache.emitter.onCache((args) => {
      if (args.parser === LendingMarketParser) {
        setLendingMarkets(getLendingMarkets());
      }
    });

    return () => {
      dispose();
    };
  }, [setLendingMarkets]);

  return {
    lendingMarkets,
  };
}

export function useLendingMarket(address?: string | PublicKey) {
  const id = typeof address === 'string' ? address : address?.toBase58();

  const connection = useConnection();
  const [lendingMarket, setLendingMarket] = useState<ParsedAccount<LendingMarket>>(
    cache.get(id || '') as ParsedAccount<LendingMarket>
  );

  useEffect(() => {
    if (!id) {
      return;
    }

    cache
      .query(connection, id, LendingMarketParser)
      .then((accountInfo) => {
        setLendingMarket(accountInfo);
      })
      .catch((err) => console.log(err));

    const dispose = cache.emitter.onCache((args) => {
      if (args.id === id) {
        setLendingMarket(cache.get(id) as ParsedAccount<LendingMarket>);
      }
    });

    return () => {
      dispose();
    };
  }, [id, setLendingMarket]);

  return lendingMarket;
}
