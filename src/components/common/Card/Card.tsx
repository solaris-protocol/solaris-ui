import React, { FC } from 'react';

import { styled } from '@linaria/react';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  flex-basis: 417px;
  flex-direction: column;
  height: 230px;
  padding: 20px;

  background-color: rgba(255, 255, 255, 0.03);
  border: 2px solid transparent;
  border-radius: 20px;

  transition: background-color 200ms ease-in-out;

  &:hover {
    background-color: #1d171f;
  }

  &.hasDeposit {
    border: 2px solid #1594dd;
  }

  &.hasBorrow {
    border: 2px solid #b745bc;
  }
`;

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const Card: FC<Props> = ({ children, className }) => {
  return <Wrapper className={className}>{children}</Wrapper>;
};
