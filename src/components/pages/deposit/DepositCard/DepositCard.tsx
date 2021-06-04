import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';
import { PublicKey } from '@solana/web3.js';
import classNames from 'classnames';

import { LendingReserve } from 'app/models/lending';
import { Card } from 'components/common/Card';
import { useUserCollateralBalance } from 'hooks';

import { Balance } from './Balance';
import { Deposit } from './Deposit';
import { Top } from './Top';
import { StateType } from './types';

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

interface Props {
  reserve: LendingReserve;
  address: PublicKey;
}

export const DepositCard: FC<Props> = ({ reserve, address }) => {
  const [state, setState] = useState<StateType>('balance');
  const { hasBalance } = useUserCollateralBalance(reserve);

  const renderContent = () => {
    switch (state) {
      case 'deposit':
        return <Deposit reserve={reserve} address={address} setState={setState} />;
      case 'balance':
      default:
        return <Balance reserve={reserve} setState={setState} />;
    }
  };

  return (
    <Card className={classNames({ hasDeposit: hasBalance })}>
      <Top reserve={reserve} state={state} />
      <Content>{renderContent()}</Content>
    </Card>
  );
};
