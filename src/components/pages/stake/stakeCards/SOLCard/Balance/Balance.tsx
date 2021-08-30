import React, { FC } from 'react';

import { useModals } from 'app/contexts/modals';
import { Button } from 'components/common/Button';
import { ButtonConnect } from 'components/common/ButtonConnect';

import { Column, Content, Title, Value } from '../../common/balance.styled';
import { Bottom } from '../../common/card.styled';
import { StateType } from '../types';

interface Props {
  setState: (state: StateType) => void;
}

export const Balance: FC<Props> = ({ setState }) => {
  const { openModal } = useModals();

  return (
    <>
      <Content>
        <Column>
          <Title>Wallet</Title>
          <Value>162.22</Value>
        </Column>
        <Column>
          <Title>Pool</Title>
          <Value>5</Value>
        </Column>
        <Column>
          <Title>Staked</Title>
          <Value>25.50</Value>
        </Column>
        <Column>
          <Title>Activating</Title>
          <Value className="state">12</Value>
        </Column>
      </Content>
      <Bottom>
        <ButtonConnect>
          <Button onClick={() => openModal('stake')} className="full">
            Stake
          </Button>
          <Button onClick={() => setState('unstake')} className="full">
            Unstake
          </Button>
          <Button onClick={() => setState('withdraw')} className="full">
            Withdraw
          </Button>
        </ButtonConnect>
      </Bottom>
    </>
  );
};
