import React, { FC } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { rgba } from 'polished';

import { formatPct } from 'utils/utils';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  height: 24px;
  margin-left: 20px;
  padding: 0 12px;

  color: #907a99;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.02em;

  background: ${rgba('#78468c', 0.2)};
  border-radius: 21px;

  &.isActive {
    color: #fff;

    background: #78468c;
  }
`;

interface Props {
  apy: number;
  isActive: boolean;
}

export const APY: FC<Props> = ({ apy, isActive }) => {
  return (
    <Wrapper title={`${apy}%`} className={classNames({ isActive })}>
      {isActive ? 'APY' : ''} {formatPct.format(apy)}
    </Wrapper>
  );
};
