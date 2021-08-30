import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { ParsedAccount } from 'app/contexts/accounts/accounts';
import { calculateBorrowAPY, Reserve } from 'app/models';
// import WalletIcon from 'assets/icons/wallet-icon.svg';
import { TokenIcon } from 'components/common/TokenIcon';
import { useTokenSymbol } from 'hooks';

// import { formatNumber } from 'utils/utils';
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
`;

const Symbol = styled.span`
  color: #fff;
  font-size: 30px;
  line-height: 37px;
  letter-spacing: 0.02em;
`;

// const WalletBalance = styled.div`
//   display: flex;
//   align-items: center;
//
//   color: #fff;
//   font-weight: 600;
//   font-size: 14px;
//   line-height: 17px;
//   letter-spacing: 0.02em;
// `;

// @ts-ignore
// const WalletIconStyled = styled(WalletIcon)`
//   width: 20px;
//   margin-right: 10px;
// `;

interface Props {
  reserve: ParsedAccount<Reserve>;
  state: StateType;
}

export const Top: FC<Props> = ({ reserve, state }) => {
  const symbol = useTokenSymbol(reserve.info.liquidity.mintPubkey);
  const apr = calculateBorrowAPY(reserve.info);
  // const tokenBalance = 0;

  return (
    <Wrapper>
      <Left>
        <TokenIconStyled mintAddress={reserve.info.liquidity.mintPubkey} size={40} />
        <Symbol>{symbol}</Symbol>
        <APR apr={apr} isActive={state === 'borrow'} />
      </Left>
      {/*<WalletBalance title={String(tokenBalance)}>*/}
      {/*  <WalletIconStyled />*/}
      {/*  {formatNumber.format(tokenBalance)}*/}
      {/*</WalletBalance>*/}
    </Wrapper>
  );
};
