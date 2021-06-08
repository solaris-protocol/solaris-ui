import React, { FC } from 'react';
import { NavLink } from 'react-router-dom';

import { styled } from '@linaria/react';

import { useModals } from 'app/contexts/modals';
import { useWallet } from 'app/contexts/wallet';
import BorrowIcon from 'assets/icons/borrow-icon.svg';
import DepositIcon from 'assets/icons/deposit-icon.svg';
import SettingsIcon from 'assets/icons/settings-icon.svg';
import WalletIcon from 'assets/icons/wallet-icon.svg';
import { SideModalType } from 'components/modals/types';

import { ButtonBottom, ButtonTopA, Wrapper } from '../common/styled';

const TopWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 14px;
`;

const ButtonTopAStyled = styled(ButtonTopA)`
  width: 58px;
  height: 58px;
`;

const ButtonBottomStyled = styled(ButtonBottom)`
  width: 58px;
  height: 58px;

  border-radius: 20px;
`;

const BottomWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;
`;

export const Closed: FC = () => {
  const { select } = useWallet();
  const { openModal } = useModals();

  const handleOpenSideModalClick = (sideModal: SideModalType) => () => {
    openModal(sideModal);
  };

  return (
    <Wrapper>
      <TopWrapper>
        <NavLink
          to="/deposit"
          isActive={(_, location) => ['/deposit', '/'].includes(location.pathname)}
          component={ButtonTopAStyled}
          className="deposit"
        >
          <DepositIcon />
        </NavLink>
        <NavLink to="/borrow" component={ButtonTopAStyled} className="borrow">
          <BorrowIcon />
        </NavLink>
      </TopWrapper>
      <BottomWrapper>
        <ButtonBottomStyled onClick={select}>
          <WalletIcon />
        </ButtonBottomStyled>
        <ButtonBottomStyled onClick={handleOpenSideModalClick('settings')}>
          <SettingsIcon />
        </ButtonBottomStyled>
      </BottomWrapper>
    </Wrapper>
  );
};
