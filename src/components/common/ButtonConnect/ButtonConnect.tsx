import React, { FC } from 'react';

import { useWallet } from 'app/contexts/wallet';

import { Button } from '../Button';

interface Props {
  children: React.ReactNode;
}

export const ButtonConnect: FC<Props> = ({ children }) => {
  const { connected, select } = useWallet();

  if (!connected) {
    return (
      <Button onClick={select} className="full">
        Connect
      </Button>
    );
  }

  return <>{children}</>;
};
