import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { SideBar } from './SideBar';

export const Wrapper = styled.div`
  display: flex;
  min-width: 100%;
  height: 100%;
`;

export const Content = styled.div`
  flex: 1;
  padding: 20px;
`;

export const Layout: FC = ({ children }) => {
  return (
    <Wrapper>
      <SideBar />
      <Content>{children}</Content>
    </Wrapper>
  );
};
