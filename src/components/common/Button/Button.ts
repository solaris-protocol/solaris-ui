import { styled } from '@linaria/react';

export const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 45px;
  padding: 0 20px;

  color: #907a99;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.02em;
  text-align: center;
  text-transform: uppercase;

  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 5px;

  transition: background-color 200ms ease-in-out, color 200ms ease-in-out;

  &:hover {
    color: #fff;

    background-color: rgba(255, 255, 255, 0.05);
  }

  &:disabled {
    background-color: rgba(255, 255, 255, 0.05);

    pointer-events: none;
  }

  &.full {
    width: 100%;
  }
`;
