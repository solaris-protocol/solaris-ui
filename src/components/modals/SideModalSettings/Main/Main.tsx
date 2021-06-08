import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { useConnectionConfig } from 'app/contexts/connection';
import ArrowIcon from 'assets/icons/arrow-icon.svg';
import EyeHideIcon from 'assets/icons/eye-hide-icon.svg';
import NetworkIcon from 'assets/icons/network-icon.svg';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  & > :not(:last-child) {
    margin-bottom: 15px;
  }
`;

const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 360px;
  height: 55px;
  padding: 0 15px 0 17px;

  font-weight: 600;
  font-size: 14px;
  line-height: 50px;
  letter-spacing: 0.02em;

  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  cursor: pointer;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 30px;
`;

const Name = styled.span`
  flex: 1;

  color: #907a99;
`;

const Network = styled.span`
  display: flex;
  align-items: center;

  color: #fff;
`;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const ArrowIconStyled = styled(ArrowIcon)`
  height: 11px;
  margin-left: 10px;

  color: #fff;
`;

interface Props {
  setState: (state: string) => void;
}

export const Main: FC<Props> = ({ setState }) => {
  const { env } = useConnectionConfig();

  return (
    <Wrapper>
      <ItemWrapper onClick={() => setState('network')}>
        <IconWrapper>
          <NetworkIcon />
        </IconWrapper>
        <Name>Network</Name>
        <Network>
          {env} <ArrowIconStyled />
        </Network>
      </ItemWrapper>
      <ItemWrapper>
        <IconWrapper>
          <EyeHideIcon />
        </IconWrapper>
        <Name>Hide zero balances</Name>
      </ItemWrapper>
    </Wrapper>
  );
};
