import React, { useContext, useEffect, useState } from 'react';

import { TokenInfo, TokenListProvider as TokenList } from '@solana/spl-token-registry';

import { useConnection, useConnectionConfig } from 'app/contexts/connection';
import slsSOLLogo from 'components/common/Layout/SideBar/logo.svg';

interface TokenListContextState {
  tokens: TokenInfo[];
  tokenMap: Map<string, TokenInfo>;
}

const TokenListContext = React.createContext<TokenListContextState>({
  tokens: [],
  tokenMap: new Map<string, TokenInfo>(),
});

// TODO: slsSOL from @solana/spl-token-registry
const SLS_SOL_TOKEN_INFO: TokenInfo = {
  chainId: 101,
  address: 'So11111111111111111111111111111111111111113',
  name: 'Solaris staked SOL (slsSOL)',
  decimals: 9,
  symbol: 'slsSOL',
  // TODO: temp logo, check design and make it svg
  logoURI: slsSOLLogo,
  tags: [],
  extensions: {
    website: 'https://solarisprotocol.com',
    twitter: 'https://twitter.com/solarisprotocol',
    discord: 'https://discord.gg/cXrhs8sbTr',
    github: 'https://github.com/solaris-protocol',
  },
};

export function TokenListProvider({ children = undefined as any }) {
  const connection = useConnection();
  const { chain } = useConnectionConfig();

  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());

  useEffect(() => {
    (async () => {
      const container = await new TokenList().resolve();
      const tokens = container.filterByChainId(chain.chainId).excludeByTag('nft').getList();
      tokens.push(SLS_SOL_TOKEN_INFO);

      const tokenMap = tokens.reduce((map, item) => {
        map.set(item.address, item);
        return map;
      }, new Map<string, TokenInfo>());

      setTokenMap(tokenMap);
      setTokens(tokens);

      // const accounts = await getMultipleAccounts(connection, [...knownMints.keys()], 'single');
      // accounts.keys.forEach((key, index) => {
      //   const account = accounts.array[index];
      //   if (!account) {
      //     return;
      //   }
      //
      //   cache.add(new PublicKey(key), account, MintParser);
      // });
    })();
  }, [connection, chain.chainId, chain.env]);

  return (
    <TokenListContext.Provider
      value={{
        tokens,
        tokenMap,
      }}
    >
      {children}
    </TokenListContext.Provider>
  );
}

export function useTokenListContext() {
  const context = useContext(TokenListContext);
  return context;
}
