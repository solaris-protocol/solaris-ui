import { useEffect, useState } from 'react';

import { PublicKey } from '@solana/web3.js';

import { cache, ParsedAccount } from 'app/contexts/accounts';
import { Obligation, ObligationParser } from 'app/models';

const getObligations = () => {
  return cache
    .byParser(ObligationParser)
    .map((id) => cache.get(id))
    .filter((acc) => acc !== undefined) as ParsedAccount<Obligation>[];
};

export function useObligations() {
  const [obligations, setObligations] = useState(getObligations());

  useEffect(() => {
    const dispose = cache.emitter.onCache((args) => {
      if (args.parser === ObligationParser) {
        setObligations(getObligations());
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

export function useObligation(address?: string | PublicKey) {
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
