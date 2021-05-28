import React from 'react';

import { SettingOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';

import { useWallet } from '../../../app/contexts/wallet';
import { LABELS } from '../../../constants';
import { ConnectButton } from '../ConnectButton';
import { CurrentUserBadge } from '../CurrentUserBadge';
import { Settings } from '../Settings';

export const AppBar = (props: { left?: JSX.Element; right?: JSX.Element }) => {
  const { connected } = useWallet();

  const TopBar = (
    <div className="App-Bar-right">
      {connected ? (
        <CurrentUserBadge />
      ) : (
        <ConnectButton
          type="text"
          size="large"
          allowWalletChange={true}
          style={{ color: '#2abdd2' }}
        />
      )}
      <Popover
        placement="topRight"
        title={LABELS.SETTINGS_TOOLTIP}
        content={<Settings />}
        trigger="click"
      >
        <Button shape="circle" size="large" type="text" icon={<SettingOutlined />} />
      </Popover>
      {props.right}
    </div>
  );

  return TopBar;
};
