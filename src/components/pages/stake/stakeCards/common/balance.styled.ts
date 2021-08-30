import { styled } from '@linaria/react';

export const Content = styled.div`
  display: flex;
  flex: 1;
  align-items: center;

  column-gap: 20px;
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

export const Value = styled.span`
  margin-top: 7px;

  color: #fff;
  font-weight: 500;
  font-size: 25px;
  line-height: 30px;
  letter-spacing: 0.02em;

  &.state {
    color: rgba(255, 255, 255, 0.3);
  }
`;
