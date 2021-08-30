import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';

import { Card } from 'components/common/Card';

import { Top } from '../common/Top';
import { Balance } from './Balance';
import { StateType } from './types';

const CardStyled = styled(Card)`
  flex-basis: 500px;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

export const SOLCard: FC = () => {
  const [state, setState] = useState<StateType>('balance');

  const renderContent = () => {
    switch (state) {
      case 'balance':
      default:
        return <Balance setState={setState} />;
    }
  };

  return (
    <CardStyled>
      <Top mintPubkey={'So11111111111111111111111111111111111111112'} />
      <Content>{renderContent()}</Content>
    </CardStyled>
  );
};
