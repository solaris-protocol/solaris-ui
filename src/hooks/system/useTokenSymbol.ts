import { PublicKey } from '@solana/web3.js';

import { useTokenListContext } from 'app/contexts/tokenList';
import { getTokenSymbol } from 'utils/utils';

export function useTokenSymbol(mintAddress?: string | PublicKey) {
  const { tokenMap } = useTokenListContext();
  const address = typeof mintAddress === 'string' ? mintAddress : mintAddress?.toBase58();
  return getTokenSymbol(tokenMap, address);
}
