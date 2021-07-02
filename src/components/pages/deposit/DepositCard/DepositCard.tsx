import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';
import { PublicKey } from '@solana/web3.js';
import classNames from 'classnames';

import { ParsedAccount } from 'app/contexts/accounts';
import { Reserve } from 'app/models';
import { Card } from 'components/common/Card';
import { useUserCollateralBalance } from 'hooks';

import { Balance } from './Balance';
import { Deposit } from './Deposit';
import { Top } from './Top';
import { StateType } from './types';
import { Withdraw } from './Withdraw';

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

interface Props {
  reserve: ParsedAccount<Reserve>;
}

export const DepositCard: FC<Props> = ({ reserve }) => {
  const [state, setState] = useState<StateType>('balance');

  // const { hasBalance } = useUserCollateralBalance(reserve);

  const hasBalance = false;

  const renderContent = () => {
    switch (state) {
      case 'deposit':
        return <Deposit reserve={reserve} setState={setState} />;
      case 'withdraw':
        return <Withdraw reserve={reserve} setState={setState} />;
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
