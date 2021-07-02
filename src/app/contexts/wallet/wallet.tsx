import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import Wallet from '@project-serum/sol-wallet-adapter';
import { WalletAdapter } from '@solana/wallet-base';

import { useConnectionConfig } from 'app/contexts/connection';
import { useModals } from 'app/contexts/modals';
import { notify } from 'utils/notifications';
import { shortenAddress, useLocalStorageState } from 'utils/utils';

import { WALLET_PROVIDERS } from './constants';

const WalletContext = React.createContext<{
  wallet: WalletAdapter | undefined;
  connected: boolean;
  selectWallet: (url: string) => void;
  provider: typeof WALLET_PROVIDERS[number] | undefined;
}>({
  wallet: undefined,
  connected: false,
  selectWallet: () => {},
  provider: undefined,
});

export function WalletProvider({ children = null as any }) {
  const { endpoint } = useConnectionConfig();

  const [autoConnect, setAutoConnect] = useState(false);
  const [providerUrl, setProviderUrl] = useLocalStorageState('walletProvider');

  const provider = useMemo(() => WALLET_PROVIDERS.find(({ url }) => url === providerUrl), [providerUrl]);

  const wallet = useMemo(
    function () {
      if (provider) {
        return new (provider.adapter || Wallet)(providerUrl, endpoint) as WalletAdapter;
      }
    },
    [provider, providerUrl, endpoint]
  );

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const handleConnect = () => {
      if (!wallet?.publicKey) {
        return;
      }

      setConnected(true);

      const walletPublicKey = wallet.publicKey.toBase58();
      const keyToDisplay = walletPublicKey.length > 20 ? shortenAddress(walletPublicKey, 7) : walletPublicKey;

      notify({
        message: 'Wallet update',
        description: 'Connected to wallet ' + keyToDisplay,
      });
    };

    const handleDisconnect = () => {
      setConnected(false);
      notify({
        message: 'Wallet update',
        description: 'Disconnected from wallet',
      });
    };

    if (wallet) {
      wallet.on('connect', handleConnect);
      wallet.on('disconnect', handleDisconnect);
    }

    return () => {
      setConnected(false);
      if (wallet) {
        wallet.off('connect', handleConnect);
        wallet.off('disconnect', handleDisconnect);

        wallet.disconnect();
      }
    };
  }, [wallet]);

  useEffect(() => {
    if (wallet && autoConnect) {
      wallet.connect();
      setAutoConnect(false);
    }

    return () => {};
  }, [wallet, autoConnect]);

  const selectWallet = useCallback((url: string) => {
    setProviderUrl(url);
    setAutoConnect(true);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connected,
        selectWallet,
        provider,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const { openModal } = useModals();
  const { wallet, connected, provider, selectWallet } = useContext(WalletContext);
  return {
    wallet,
    connected,
    provider,
    select: () => openModal('wallet'),
    selectWallet,
    connect() {
      wallet ? wallet.connect() : openModal('wallet');
    },
    disconnect() {
      wallet?.disconnect();
    },
  };
}
