import React, { FC, useState } from 'react';

import { Content, Wrapper } from './Layout.styled';
import { SideBar } from './SideBar';

export const Layout: FC = ({ children }) => {
  return (
    <Wrapper>
      <SideBar />
      <Content>{children}</Content>
    </Wrapper>
  );
};
