import { useEffect, useState } from 'react';

import { PublicKey } from '@solana/web3.js';

import { cache, ParsedAccount } from 'app/contexts/accounts';
import { LendingMarket } from 'app/models/lending';

export function useLendingMarket(address?: string | PublicKey) {
  const id = typeof address === 'string' ? address : address?.toBase58();
  const [lendingMarket, setLendingMarket] = useState<ParsedAccount<LendingMarket>>(
    cache.get(id || '') as ParsedAccount<LendingMarket>
  );

  useEffect(() => {
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
