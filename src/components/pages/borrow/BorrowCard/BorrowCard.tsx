import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { ParsedAccount } from 'app/contexts/accounts';
import { Reserve } from 'app/models';
import { Card } from 'components/common/Card';

import { Balance } from './Balance';
import { Borrow } from './Borrow';
import { Repay } from './Repay';
import { Top } from './Top';
import { StateType } from './types';

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

interface Props {
  reserve: ParsedAccount<Reserve>;
}

export const BorrowCard: FC<Props> = ({ reserve }) => {
  const [state, setState] = useState<StateType>('balance');

  const hasBorrow = false;

  const renderContent = () => {
    switch (state) {
      case 'borrow':
        return <Borrow reserve={reserve} setState={setState} />;
      case 'repay':
        return <Repay reserve={reserve} setState={setState} />;
      case 'balance':
      default:
        return <Balance reserve={reserve} setState={setState} />;
    }
  };

  return (
    <Card className={classNames({ hasBorrow })}>
      <Top reserve={reserve} state={state} />
      <Content>{renderContent()}</Content>
    </Card>
  );
};
