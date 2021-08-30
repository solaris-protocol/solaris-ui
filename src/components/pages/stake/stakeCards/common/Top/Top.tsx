import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { TokenIcon } from 'components/common/TokenIcon';
import { useTokenSymbol } from 'hooks';

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

interface Props {
  mintPubkey: string;
}

export const Top: FC<Props> = ({ mintPubkey }) => {
  const symbol = useTokenSymbol(mintPubkey);
  return (
    <Wrapper>
      <Left>
        <TokenIconStyled mintAddress={mintPubkey} size={40} />
        <Symbol title={mintPubkey}>{symbol}</Symbol>
      </Left>
    </Wrapper>
  );
};
