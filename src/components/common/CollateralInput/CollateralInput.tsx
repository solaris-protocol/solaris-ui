import React, { FC } from 'react';

import { styled } from '@linaria/react';
import { PublicKey } from '@solana/web3.js';
import classNames from 'classnames';

import { usePrice } from 'app/contexts/pyth';
import { formatNumber } from 'utils/utils';

const WrapperLabel = styled.label`
  display: flex;
  flex-direction: column;

  white-space: nowrap;
`;

const Input = styled.input`
  position: relative;

  width: 100%;
  padding: 0;

  color: #fff;
  font-weight: 600;
  font-size: 30px;
  line-height: 37px;
  letter-spacing: 0.02em;

  background-color: transparent;
  border: none;
  outline: none;

  &.isZero {
    color: #45364d;
  }

  &::placeholder {
    color: #45364d;
  }

  &::before {
    position: absolute;

    display: block;

    color: #45364d;

    content: attr(placeholder);
  }
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
    let value = e.target.value
      .replace(',', '.')
      .replace(/[^\d.,]/g, '')
      .replace(/^(\d*\.?)|(\d*)\.?/g, '$1$2');

    if (value === '.') {
      value = '0.';
    }

    onChange(value);
  };

  return (
    <WrapperLabel>
      <Input value={value} placeholder="0.00" onChange={handleValueChange} className={classNames({ isZero: !value })} />
      <BalanceUSD>${formatNumber.format(valueIsUSD)}</BalanceUSD>
    </WrapperLabel>
  );
};
