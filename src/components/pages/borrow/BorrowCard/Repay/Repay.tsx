import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';
import { PublicKey } from '@solana/web3.js';

import { Button } from 'components/common/Button';
import { ButtonConnect } from 'components/common/ButtonConnect';
import { ButtonLoading } from 'components/common/ButtonLoading';
import { CollateralInput } from 'components/common/CollateralInput';

import { Bottom } from '../common/styled';
import { StateType } from '../types';
import { Range } from './Range';

const CollateralBalanceWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
`;

const MaxButton = styled.button`
  height: 26px;
  padding: 0 10px;

  color: #fff;
  font-weight: bold;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: 0.15em;
  text-transform: uppercase;

  background-color: transparent;
  border: 1px solid #fff;
  border-radius: 5px;
  opacity: 0.5;

  transition: opacity 200ms ease-in-out;

  &:hover {
    opacity: 1;
  }
`;

interface Props {
  setState: (state: StateType) => void;
}

export const Repay: FC<Props> = ({ setState }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState('');

  const liquidityMint = new PublicKey('So11111111111111111111111111111111111111112');

  const handleValueChange = (nextValue: string) => {
    setValue(nextValue);
  };

  const handleMaxClick = () => {
    // setValue(balance.toString());
  };

  const handleRepayClick = async () => {
    setIsLoading(true);
    // TODO: deposit
    await new Promise((resolve) => setTimeout(resolve, 300));
    setState('balance');
  };

  return (
    <>
      <CollateralBalanceWrapper>
        <CollateralInput priceAddress={liquidityMint} value={value} onChange={handleValueChange} />
        <Range />
      </CollateralBalanceWrapper>
      <Bottom>
        {isLoading ? (
          <ButtonLoading />
        ) : (
          <ButtonConnect>
            <Button onClick={handleRepayClick} className="full">
              Repay
            </Button>
            <Button onClick={() => setState('balance')}>Cancel</Button>
          </ButtonConnect>
        )}
      </Bottom>
    </>
  );
};
