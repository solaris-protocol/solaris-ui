import React, { FC } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { formatNumber } from 'utils/utils';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  white-space: nowrap;

  pointer-events: none;
`;

const Balance = styled.span`
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
`;

const BalanceUSD = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.02em;
`;

interface Props {
  balance: number;
  balanceInUSD: number;
}

export const CollateralBalance: FC<Props> = ({ balance, balanceInUSD }) => {
  return (
    <Wrapper>
      <Balance className={classNames({ isZero: !balance })}>{formatNumber.format(balance)}</Balance>
      {balanceInUSD ? <BalanceUSD>${formatNumber.format(balanceInUSD)}</BalanceUSD> : null}
    </Wrapper>
  );
};
