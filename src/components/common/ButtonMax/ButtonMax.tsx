import React, { ButtonHTMLAttributes, FC } from 'react';

import { styled } from '@linaria/react';

const ButtonElement = styled.button`
  height: 26px;
  padding: 0 10px;

  color: #fff;
  font-weight: bold;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: 0.15em;
  text-transform: uppercase;

  background: transparent;
  border: 1px solid #fff;
  border-radius: 5px;
  opacity: 0.5;

  transition: opacity 200ms ease-in-out;

  &:hover {
    opacity: 1;
  }
`;

interface Props {}

export const ButtonMax: FC<Props & ButtonHTMLAttributes<HTMLButtonElement>> = ({ ...props }) => {
  return <ButtonElement {...props}>Max</ButtonElement>;
};
