import React, { FC } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  height: 130px;
  padding: 0 30px;
  overflow: hidden;

  column-gap: 30px;

  border-radius: 20px;
  opacity: 0.97;

  transition: background 0.2s ease-out;

  &.deposit {
    background: linear-gradient(92.18deg, #00c0f2 -43.31%, #06c 102.49%);
  }

  &.borrow {
    background: linear-gradient(92.18deg, #9c32be -43.31%, #a422a1 102.49%);
  }

  &.stake {
    background-image: linear-gradient(180deg, rgba(164, 34, 161, 0.15) -13.46%, rgba(220, 31, 255, 0.15) 100%),
      url('./bg-stake.png');
    background-repeat: no-repeat;
    background-position: center right;
    background-size: cover;

    &::after {
      opacity: 0.04;
    }
  }

  &.isLoading {
    &::before {
      opacity: 1;
    }
  }

  &::before {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -100;

    width: 100%;
    height: 100%;

    background-image: linear-gradient(91.31deg, rgba(0, 189, 255, 0.97) -15.35%, rgba(0, 255, 163, 0.97) 101.51%);
    opacity: 0;

    transition: opacity 0.2s ease-out;

    content: '';
  }

  &::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    background: url('./lines.svg') no-repeat 65% 35%;
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

  &.stake {
    color: rgba(255, 255, 255, 0.5);
  }
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
  type: 'deposit' | 'borrow' | 'stake';
  columns: { title: string; value: number | string }[];
  className?: string;
}

export const TotalInfo: FC<Props> = ({ type, columns, className }) => {
  return (
    <Wrapper className={classNames(className, { [type]: true })}>
      {columns.map((column) => (
        <Column key={column.title}>
          <Title className={classNames({ [type]: true })}>{column.title}</Title>
          <Value>{column.value}</Value>
        </Column>
      ))}
    </Wrapper>
  );
};
