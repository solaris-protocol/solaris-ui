import React, { FC } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  height: 130px;
  padding: 0 30px;

  column-gap: 30px;

  border-radius: 20px;
  opacity: 0.97;

  &.deposit {
    background: linear-gradient(92.18deg, #00c0f2 -43.31%, #06c 102.49%);
  }

  &.borrow {
    background: linear-gradient(92.18deg, #9c32be -43.31%, #a422a1 102.49%);
  }

  &::before {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    background: url('./lines.svg') no-repeat 50% 30%;
    opacity: 0.1;

    content: '';
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;

  &.collateral > * {
    opacity: 0.7;
  }
`;

const Title = styled.span`
  color: #fff;
  font-weight: 600;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const Value = styled.span`
  margin-top: 8px;

  color: #fff;
  font-weight: 300;
  font-size: 50px;
  line-height: 61px;
  letter-spacing: 0.02em;
`;

interface Props {
  type: 'deposit' | 'borrow';
  columns: { title: string; value: number | string }[];
}

export const TotalInfo: FC<Props> = ({ type, columns }) => {
  return (
    <Wrapper className={classNames({ [type]: true })}>
      {columns.map((column) => (
        <Column key={column.title}>
          <Title>{column.title}</Title>
          <Value>{column.value}</Value>
        </Column>
      ))}
    </Wrapper>
  );
};
