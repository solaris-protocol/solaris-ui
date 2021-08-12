import React, { FC, useCallback, useMemo } from 'react';

import { WalletError } from '@solana/wallet-adapter-base';
import { WalletProvider } from '@solana/wallet-adapter-react';
import {
  getLedgerWallet,
  getMathWallet,
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolongWallet,
  getTorusWallet,
} from '@solana/wallet-adapter-wallets';

import { AccountsProvider } from 'app/contexts/accounts';
import { ConnectionProvider } from 'app/contexts/connection';
import { LendingProvider } from 'app/contexts/lending';
import { MarketProvider } from 'app/contexts/market';
import { ModalsProvider } from 'app/contexts/modals';
import { PythProvider } from 'app/contexts/pyth';
import { notify } from 'utils/notifications';

export const Providers: FC = ({ children }) => {
  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSolongWallet(),
      getSolletWallet(),
      getSolflareWallet(),
      getLedgerWallet(),
      getMathWallet(),
      getTorusWallet({
        options: { clientId: process.env.TORUS_PROJECT_ID || '' },
      }),
    ],
    []
  );

  const onError = useCallback((error: WalletError) => {
    notify({
      message: error.name,
      description: error.message,
      type: 'error',
    });

    console.error(error);
  }, []);

  return (
    <ConnectionProvider>
      <WalletProvider wallets={wallets} onError={onError}>
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
