import { useEffect, useState } from 'react';

import { PublicKey } from '@solana/web3.js';

import { cache, ParsedAccount } from 'app/contexts/accounts';
import { Obligation, ObligationParser } from 'app/models';

const getLendingObligations = () => {
  return cache
    .byParser(ObligationParser)
    .map((id) => cache.get(id))
    .filter((acc) => acc !== undefined) as ParsedAccount<Obligation>[];
};

export function useLendingObligations() {
  const [obligations, setObligations] = useState(getLendingObligations());

  // console.log(
  //   111,
  //   obligations.map((o) => {
  //     return o.info.deposits.map((d) => [
  //       d.depositReserve.toBase58(),
  //       d.depositedAmount.toString(),
  //       d.marketValue.toString(),
  //     ]);
  //   })
  // );

  useEffect(() => {
    const dispose = cache.emitter.onCache((args) => {
      if (args.parser === ObligationParser) {
        setObligations(getLendingObligations());
      }
    });

    return () => {
      dispose();
    };
  }, [setObligations]);

  return {
    obligations,
  };
}

export function useLendingObligation(address?: string | PublicKey) {
  const id = typeof address === 'string' ? address : address?.toBase58();
  const [obligationAccount, setObligationAccount] = useState(cache.get(id || '') as ParsedAccount<Obligation>);

  useEffect(() => {
    const dispose = cache.emitter.onCache((args) => {
      if (args.id === id) {
        setObligationAccount(cache.get(id) as ParsedAccount<Obligation>);
      }
    });

    return () => {
      dispose();
    };
  }, [id, setObligationAccount]);

  return obligationAccount;
}
