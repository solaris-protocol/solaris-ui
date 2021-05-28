import React, { FC } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { useWallet, WALLET_PROVIDERS } from 'app/contexts/wallet';
import { SideModalPropsType } from 'components/modals/types';
import { shortenAddress } from 'utils/utils';

import { Modal } from '../common/Modal';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Button = styled.button`
  position: relative;

  display: flex;
  align-items: center;
  width: 278px;
  height: 45px;
  padding: 0 13px 0 17px;

  color: #907a99;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.02em;
  text-align: left;

  background: #211d23;
  background-clip: padding-box;
  border: 1px solid transparent;
  border-radius: 10px;

  &.isActive {
    background: #2a1a2e;

    &::before {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: -1;

      margin: -2px;

      background: linear-gradient(180deg, #b745bc, #7b279a);
      border-radius: inherit;

      content: '';
    }
  }

  &:not(:last-child) {
    margin-bottom: 15px;
  }
`;

const Img = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 13px;
`;

const Name = styled.span`
  flex: 1;
`;

const Address = styled.span`
  color: #907a99;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.02em;
`;

export const SideModalWallet: FC<SideModalPropsType> = ({ close, ...props }) => {
  const { wallet, selectWallet, provider } = useWallet();

  const handleWalletClick = (url: string) => () => {
    selectWallet(url);
    close();
  };

  const renderWalletAddress = (url: string) => {
    if (provider?.url !== url || !wallet?.publicKey) {
      return null;
    }

    return <Address>{shortenAddress(wallet.publicKey.toBase58())}</Address>;
  };

  return (
    <Modal title="Select wallet" close={close} {...props}>
      <Content>
        {WALLET_PROVIDERS.map((providerItem) => (
          <Button
            key={providerItem.name}
            onClick={handleWalletClick(providerItem.url)}
            className={classNames({ isActive: provider?.url === providerItem.url })}
          >
            <Img alt={`${providerItem.name}`} src={providerItem.icon} />
            <Name>{providerItem.name}</Name>
            {renderWalletAddress(providerItem.url)}
          </Button>
        ))}
      </Content>
    </Modal>
  );
};
