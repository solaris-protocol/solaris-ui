import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { ParsedAccount } from 'app/contexts/accounts/accounts';
import { Reserve } from 'app/models';
import { Card } from 'components/common/Card';

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
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const DepositCard: FC<Props> = ({ reserve, isLoading, setIsLoading }) => {
  const [state, setState] = useState<StateType>('balance');

  // const { hasBalance } = useUserCollateralBalance(reserve);

  const hasBalance = false;

  const renderContent = () => {
    switch (state) {
      case 'deposit':
        return <Deposit reserve={reserve} setState={setState} isLoading={isLoading} setIsLoading={setIsLoading} />;
      case 'withdraw':
        return <Withdraw reserve={reserve} setState={setState} isLoading={isLoading} setIsLoading={setIsLoading} />;
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
