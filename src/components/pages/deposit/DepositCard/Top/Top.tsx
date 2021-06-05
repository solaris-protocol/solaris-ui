import React, { FC } from 'react';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { calculateDepositAPY, Reserve } from 'app/models';
import WalletIcon from 'assets/icons/wallet-icon.svg';
import { APY } from 'components/common/APY';
import { TokenIcon } from 'components/common/TokenIcon';
import { StateType } from 'components/pages/deposit/DepositCard/types';
import { useTokenName, useUserBalance } from 'hooks';
import { formatNumber, formatPct } from 'utils/utils';

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
  reserve: Reserve;
  state: StateType;
}

export const Top: FC<Props> = ({ reserve, state }) => {
  const name = useTokenName(reserve.liquidity.mintPubkey);
  const { balance: tokenBalance } = useUserBalance(reserve.liquidity.mintPubkey);

  const apy = calculateDepositAPY(reserve);

  return (
    <Wrapper>
      <Left>
        <TokenIconStyled mintAddress={reserve.liquidity.mintPubkey} size={40} />
        <Symbol>{name}</Symbol>
        <APY apy={apy} isActive={state === 'deposit'} />
      </Left>
      <WalletBalance title={String(tokenBalance)}>
        <WalletIconStyled />
        {formatNumber.format(tokenBalance)}
      </WalletBalance>
    </Wrapper>
  );
};
