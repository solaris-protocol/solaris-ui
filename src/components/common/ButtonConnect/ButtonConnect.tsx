import React, { FC } from 'react';

import { useWallet } from '@solana/wallet-adapter-react';

import { useModals } from 'app/contexts/modals';

import { Button } from '../Button';

interface Props {
  children: React.ReactNode;
}

export const ButtonConnect: FC<Props> = ({ children }) => {
  const { connected, connect } = useWallet();
  const { openModal } = useModals();

  if (!connected) {
    return (
      <Button onClick={() => (connected ? connect() : openModal('wallet'))} className="full">
        Connect
      </Button>
    );
  }

  return <>{children}</>;
};
