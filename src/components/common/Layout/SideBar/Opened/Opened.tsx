import React, { FC } from 'react';
import { NavLink } from 'react-router-dom';

import { styled } from '@linaria/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { rgba } from 'polished';

import { useModals } from 'app/contexts/modals';
import SettingsIcon from 'assets/icons/settings-icon.svg';
import WalletIcon from 'assets/icons/wallet-icon.svg';
import { SideModalType } from 'components/modals/types';
import { useDev } from 'hooks/system/useDev';
import { shortenAddress } from 'utils/utils';

import { ButtonBottom, ButtonTopA, Wrapper } from '../common/styled';

const TopWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 18px;
`;

const ButtonTopAStyled = styled(ButtonTopA)`
  width: 131px;
  height: 40px;

  color: ${rgba('#907A99', 0.75)};
  font-weight: bold;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

const ButtonBottomStyled = styled(ButtonBottom)`
  height: 32px;

  border-radius: 10px;
`;

const ButtonWallet = styled(ButtonBottomStyled)`
  padding: 0 10px;

  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.02em;
`;

// @ts-ignore
const WalletIconStyled = styled(WalletIcon)`
  margin-left: 10px;
`;

const ButtonSettings = styled(ButtonBottomStyled)`
  height: 32px;
`;

const BottomWrapper = styled.div`
  display: flex;

  column-gap: 10px;
`;

export const Opened: FC = () => {
  const isDev = useDev();
  const { publicKey } = useWallet();
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
          Deposit
        </NavLink>
        <NavLink to="/borrow" component={ButtonTopAStyled} className="borrow">
          Borrow
        </NavLink>
        {isDev ? (
          <NavLink to="/stake" component={ButtonTopAStyled} className="stake">
            Stake
          </NavLink>
        ) : null}
      </TopWrapper>
      <BottomWrapper>
        <ButtonWallet onClick={() => openModal('wallet')}>
          {publicKey ? shortenAddress(publicKey.toBase58()) : 'Connect'}
          <WalletIconStyled />
        </ButtonWallet>
        <ButtonSettings onClick={handleOpenSideModalClick('settings')}>
          <SettingsIcon />
        </ButtonSettings>
      </BottomWrapper>
    </Wrapper>
  );
};
