import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { cache, ParsedAccount, useMint } from 'app/contexts/accounts';
import { Reserve } from 'app/models';
import { Card } from 'components/common/Card';
import { EnrichedLendingObligation, useUserCollateralBalance } from 'hooks';
import { fromLamports, wadToLamports } from 'utils/utils';

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
  obligation?: EnrichedLendingObligation;
}

export const BorrowCard: FC<Props> = ({ obligation }) => {
  const [state, setState] = useState<StateType>('balance');

  const renderContent = () => {
    switch (state) {
      case 'deposit':
        return <Deposit setState={setState} />;
      case 'balance':
      default:
        return <Balance setState={setState} />;
    }
  };

  return (
    <Card className={classNames({ hasDeposit: true })}>
      <Top state={state} />
      <Content>{renderContent()}</Content>
    </Card>
  );
};
