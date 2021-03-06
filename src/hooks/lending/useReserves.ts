import { useEffect, useMemo, useState } from 'react';

import { TokenInfo } from '@solana/spl-token-registry';
import { PublicKey } from '@solana/web3.js';

import { cache, ParsedAccount } from 'app/contexts/accounts';
import { useTokenListContext } from 'app/contexts/tokenList';
import { Reserve, ReserveParser } from 'app/models';
import { getTokenBySymbol } from 'utils/utils';

export const getReserves = () => {
  return cache
    .byParser(ReserveParser)
    .map((id) => cache.get(id))
    .filter((acc) => acc !== undefined) as ParsedAccount<Reserve>[];
};

export function useReserves() {
  const [reserveAccounts, setReserveAccounts] = useState<ParsedAccount<Reserve>[]>(getReserves());

  useEffect(() => {
    const dispose = cache.emitter.onCache((args) => {
      if (args.parser === ReserveParser) {
        setReserveAccounts(getReserves());
      }
    });

    return () => {
      dispose();
    };
  }, [setReserveAccounts]);

  return {
    reserveAccounts,
  };
}

export function useReserve(address?: string | PublicKey) {
  const { tokenMap } = useTokenListContext();
  const { reserveAccounts } = useReserves();
  let addressName = address;
  if (typeof address === 'string') {
    const token: TokenInfo | null = getTokenBySymbol(tokenMap, address);
    if (token) {
      const account = reserveAccounts.filter((acc) => acc.info.liquidity.mintPubkey.toBase58() === token.address)[0];
      if (account) {
        addressName = account.pubkey;
      }
    }
  }
  const id = useMemo(() => (typeof addressName === 'string' ? addressName : addressName?.toBase58()), [addressName]);

  const [reserveAccount, setReserveAccount] = useState<ParsedAccount<Reserve>>(
    cache.get(id || '') as ParsedAccount<Reserve>
  );

  useEffect(() => {
    const dispose = cache.emitter.onCache((args) => {
      if (args.id === id) {
        setReserveAccount(cache.get(id) as ParsedAccount<Reserve>);
      }
    });

    return () => {
      dispose();
    };
  }, [id, setReserveAccount]);

  return reserveAccount;
}
