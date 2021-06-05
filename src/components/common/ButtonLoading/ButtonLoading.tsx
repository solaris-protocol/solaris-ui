import React, { FC } from 'react';

import { styled } from '@linaria/react';

import ClockIcon from 'assets/icons/clock-icon.svg';
import { Button } from 'components/common/Button';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const ClockIconStyled = styled(ClockIcon)`
  margin-right: 10px;
`;

export const ButtonLoading: FC = () => {
  return (
    <Button disabled className="full">
      <ClockIconStyled /> Please wait...
    </Button>
  );
};
