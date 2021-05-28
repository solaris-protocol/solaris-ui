import React from 'react';

import { LAMPORTS_PER_SOL } from '@solana/web3.js';

import { useNativeAccount } from '../../../app/contexts/accounts';
import { useWallet } from '../../../app/contexts/wallet';
import { formatNumber, shortenAddress } from '../../../utils/utils';
import { Identicon } from '../Identicon';

export const CurrentUserBadge = (props: {}) => {
  const { wallet } = useWallet();
  const { account } = useNativeAccount();

  if (!wallet?.publicKey) {
    return null;
  }

  // should use SOL ◎ ?

  return (
    <div className="wallet-wrapper">
      <span>{formatNumber.format((account?.lamports || 0) / LAMPORTS_PER_SOL)} SOL</span>
      <div className="wallet-key">
        {shortenAddress(`${wallet.publicKey}`)}
        <Identicon
          address={wallet.publicKey.toBase58()}
          style={{ marginLeft: '0.5rem', display: 'flex' }}
        />
      </div>
    </div>
  );
};
