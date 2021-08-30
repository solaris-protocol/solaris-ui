import React, { FC } from 'react';

import { Button } from 'components/common/Button';
import { ButtonConnect } from 'components/common/ButtonConnect';

import { Column, Content, Title, Value } from '../../common/balance.styled';
import { Bottom } from '../../common/card.styled';
import { StateType } from '../types';

interface Props {
  setState: (state: StateType) => void;
}

export const Balance: FC<Props> = ({ setState }) => {
  return (
    <>
      <Content>
        <Column>
          <Title>Wallet</Title>
          <Value>1</Value>
        </Column>
        <Column>
          <Title>READY TO CLAIM</Title>
          <Value>5</Value>
        </Column>
        <Column>
          <Title>PROCESSING</Title>
          <Value className="state">12</Value>
        </Column>
      </Content>
      <Bottom>
        <ButtonConnect>
          <Button onClick={() => setState('swap')} className="full">
            Swap
          </Button>
          <Button onClick={() => setState('claim')} className="full">
            Claim
          </Button>
          <Button onClick={() => setState('withdraw')} className="full">
            Withdraw
          </Button>
        </ButtonConnect>
      </Bottom>
    </>
  );
};
