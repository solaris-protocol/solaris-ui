import React, { FC } from 'react';

import { styled } from '@linaria/react';
import { PublicKey } from '@solana/web3.js';

import WalletIcon from 'assets/icons/wallet-icon.svg';
import { TokenIcon } from 'components/common/TokenIcon';
import { formatNumber } from 'utils/utils';

import { StateType } from '../types';
import { APR } from './APR';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const TokenIconStyled = styled(TokenIcon)`
  margin-right: 15px;

  &.active {
    box-shadow: 0 -1px 15px rgba(255, 255, 255, 0.25);
  }
`;

const Symbol = styled.span`
  color: #fff;
  font-size: 30px;
  line-height: 37px;
  letter-spacing: 0.02em;
`;

const WalletBalance = styled.div`
  display: flex;
  align-items: center;

  color: #fff;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.02em;
`;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const WalletIconStyled = styled(WalletIcon)`
  width: 20px;
  margin-right: 10px;
`;

interface Props {
  state: StateType;
}

export const Top: FC<Props> = ({ state }) => {
  const name = 'SOL';
  const apr = 1;
  const liquidityMint = new PublicKey('So11111111111111111111111111111111111111112');
  const tokenBalance = 0.0001;

  return (
    <Wrapper>
      <Left>
        <TokenIconStyled mintAddress={liquidityMint} size={40} />
        <Symbol>{name}</Symbol>
        <APR apr={apr} isActive={state === 'borrow'} />
      </Left>
      <WalletBalance title={String(tokenBalance)}>
        <WalletIconStyled />
        {formatNumber.format(tokenBalance)}
      </WalletBalance>
    </Wrapper>
  );
};
