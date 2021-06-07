import { styled } from '@linaria/react';

export const Wrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  row-gap: 20px;
`;

export const ButtonTopA = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;

  color: #907a99;

  background: transparent;
  border-radius: 20px;

  &.active {
    color: #fff !important;
  }

  &.deposit.active {
    background: linear-gradient(345.19deg, #02ccfc -27.46%, #0296cc 50%);
    box-shadow: 0 4px 150px rgba(220, 31, 255, 0.15);
  }

  &.borrow.active {
    background: linear-gradient(342.77deg, #7c3194 -16.05%, #6d1c8a 61.84%);
    box-shadow: 0 4px 150px rgba(220, 31, 255, 0.15);
  }

  &:hover {
    color: #fff !important;
  }
`;

export const ButtonBottom = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  color: #907a99;

  background: rgba(255, 255, 255, 0.05);
`;
