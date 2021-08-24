import { PublicKey } from '@solana/web3.js';

import { useTokenListContext } from 'app/contexts/tokenList';
import { getTokenName } from 'utils/utils';

export function useTokenName(mintAddress?: string | PublicKey) {
  const { tokenMap } = useTokenListContext();
  const address = typeof mintAddress === 'string' ? mintAddress : mintAddress?.toBase58();
  return getTokenName(tokenMap, address);
}
