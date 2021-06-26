import React, { FC } from 'react';

import { AccountsProvider } from 'app/contexts/accounts';
import { ConnectionProvider } from 'app/contexts/connection';
import { LendingProvider } from 'app/contexts/lending';
import { MarketProvider } from 'app/contexts/market';
import { ModalsProvider } from 'app/contexts/modals';
import { PythProvider } from 'app/contexts/pyth';
import { WalletProvider } from 'app/contexts/wallet';

export const Providers: FC = ({ children }) => {
  return (
    <ConnectionProvider>
      <WalletProvider>
        <ModalsProvider>
          <AccountsProvider>
            <PythProvider>
              <MarketProvider>
                <LendingProvider>{children}</LendingProvider>
              </MarketProvider>
            </PythProvider>
          </AccountsProvider>
        </ModalsProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
