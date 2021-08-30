import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { StakeReceiveTitle } from 'components/modals/stakeModals/common/styled';

const Wrapper = styled.div`
  margin-bottom: 10px;
`;

export const YouReceive: FC = () => {
  return (
    <Wrapper>
      <StakeReceiveTitle>You receive</StakeReceiveTitle>
    </Wrapper>
  );
};
