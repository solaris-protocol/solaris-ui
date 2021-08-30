import { styled } from '@linaria/react';

export const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50px;
  padding: 0 20px;

  color: #fff;
  font-weight: 600;
  font-size: 15px;
  line-height: 18px;
  letter-spacing: 0.02em;
  text-align: center;
  text-transform: uppercase;

  background: linear-gradient(92.18deg, #9c32be -43.31%, #a422a1 102.49%);
  border-radius: 10px;
  opacity: 0.97;

  transition: opacity 200ms ease-in-out;

  &:hover {
    color: #fff;

    opacity: 1;
  }

  &:disabled {
    color: #907a99;

    background-color: rgba(255, 255, 255, 0.05);

    cursor: default;
  }
`;

export const StakeReceiveTitle = styled.span`
  color: #fff;
  font-weight: 600;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;
