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

interface Props {
  setState: (state: StateType) => void;
}

export const Borrow: FC<Props> = ({ setState }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState('');

  const liquidityMint = new PublicKey('So11111111111111111111111111111111111111112');

  const handleValueChange = (nextValue: string) => {
    setValue(nextValue);
  };

  const handleMaxClick = () => {
    // setValue(balance.toString());
  };

  const handleBorrowClick = async () => {
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
            <Button onClick={handleBorrowClick} className="full">
              Borrow
            </Button>
            <Button onClick={() => setState('balance')}>Cancel</Button>
          </ButtonConnect>
        )}
      </Bottom>
    </>
  );
};
