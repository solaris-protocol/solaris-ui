import React, { FC } from 'react';

import { styled } from '@linaria/react';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 20px;

  background: linear-gradient(307.88deg, #3c254d -43.8%, rgba(60, 37, 77, 0) 257.09%);
  border-radius: 15px;
`;

const Left = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
`;

const Text = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: 0.06em;
`;

const Value = styled.span`
  margin: 0 10px;

  color: #fff;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.02em;
  white-space: nowrap;
`;

const Button = styled.button`
  color: #907a99;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.02em;
  text-transform: uppercase;

  transition: color 200ms ease-in-out;

  &:hover {
    color: #fff;
  }
`;

interface Props {}

export const ReDelegate: FC<Props> = (props) => {
  return (
    <Wrapper>
      <Left>
        <Text>You’ve staked</Text>
        <Value>100,500.55 SOL</Value>
        <Text>outside</Text>
      </Left>
      <Button>RE-DELEGATE</Button>
    </Wrapper>
  );
};
