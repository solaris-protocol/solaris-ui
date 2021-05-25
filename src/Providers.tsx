import React, { FC } from 'react';

import { AccountsProvider } from './app/contexts/accounts';
import { ConnectionProvider } from './app/contexts/connection';
import { LendingProvider } from './app/contexts/lending';
import { MarketProvider } from './app/contexts/market';
import { WalletProvider } from './app/contexts/wallet';

export const Providers: FC = ({ children }) => {
  return (
    <ConnectionProvider>
      <WalletProvider>
        <AccountsProvider>
          <MarketProvider>
            <LendingProvider>{children}</LendingProvider>
          </MarketProvider>
        </AccountsProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
