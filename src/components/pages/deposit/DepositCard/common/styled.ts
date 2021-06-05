import { styled } from '@linaria/react';

export const MaxButton = styled.button`
  height: 26px;
  padding: 0 10px;

  color: #fff;
  font-weight: bold;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: 0.15em;
  text-transform: uppercase;

  background-color: transparent;
  border: 1px solid #fff;
  border-radius: 5px;
  opacity: 0.5;

  transition: opacity 200ms ease-in-out;

  &:hover {
    opacity: 1;
  }
`;

export const Bottom = styled.div`
  display: flex;
  margin-top: 5px;

  column-gap: 12px;
`;
