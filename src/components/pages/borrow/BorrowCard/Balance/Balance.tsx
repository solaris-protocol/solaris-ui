import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { Reserve } from 'app/models';
import { Button } from 'components/common/Button';
import { ButtonConnect } from 'components/common/ButtonConnect';
import { CollateralBalance } from 'components/common/CollateralBalance';

import { Bottom } from '../common/styled';
import { StateType } from '../types';

const CollateralBalanceWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;

  text-align: center;
`;

interface Props {
  setState: (state: StateType) => void;
}

export const Balance: FC<Props> = ({ setState }) => {
  const balance = 0;
  const balanceInUSD = 0;

  return (
    <>
      <CollateralBalanceWrapper>
        <CollateralBalance balance={balance} balanceInUSD={balanceInUSD} />
      </CollateralBalanceWrapper>
      <Bottom>
        <ButtonConnect>
          <Button onClick={() => setState('deposit')} className="full">
            Borrow
          </Button>
          {balance ? (
            <Button onClick={() => setState('withdraw')} className="full">
              Repay
            </Button>
          ) : null}
        </ButtonConnect>
      </Bottom>
    </>
  );
};
