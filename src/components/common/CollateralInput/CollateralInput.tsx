import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { usePrice } from 'app/contexts/pyth';
import { formatNumber } from 'utils/utils';

import { Input } from '../Input';

const WrapperLabel = styled.label`
  display: flex;
  flex-direction: column;

  white-space: nowrap;
`;

const BalanceUSD = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.02em;
`;

interface Props {
  mintAddress: string;
  value: string;
  onChange: (nextValue: string) => void;
}

export const CollateralInput: FC<Props> = ({ mintAddress, value, onChange }) => {
  const price = usePrice(mintAddress);
  const valueIsUSD = price * (parseFloat(value) || 0);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <WrapperLabel>
      <Input value={value} placeholder="0.00" onChange={handleValueChange} />
      <BalanceUSD>${formatNumber.format(valueIsUSD)}</BalanceUSD>
    </WrapperLabel>
  );
};
