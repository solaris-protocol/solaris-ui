import React, { FC } from 'react';

import { PublicKey } from '@solana/web3.js';

import { useTokenListContext } from 'app/contexts/tokenList';
import { getTokenIcon } from 'utils/utils';

import { Identicon } from '../Identicon';

interface Props {
  mintAddress: string | PublicKey;
  style?: React.CSSProperties;
  size?: number;
  className?: string;
}

export const TokenIcon: FC<Props> = ({ mintAddress, size, style, className }) => {
  const { tokenMap } = useTokenListContext();
  const icon = getTokenIcon(tokenMap, mintAddress);

  const customSize = size || 20;

  if (icon) {
    return (
      <img
        key={icon}
        alt="Token icon"
        src={icon}
        width={style?.width || customSize.toString()}
        height={style?.height || customSize.toString()}
        style={{
          borderRadius: '50%',
          backgroundColor: '#2E1C34',
          ...style,
        }}
        className={className}
      />
    );
  }

  return (
    <Identicon
      address={mintAddress}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        ...style,
      }}
      className={className}
    />
  );
};
