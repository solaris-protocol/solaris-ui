import React, { FC, useEffect, useRef } from 'react';

import { styled } from '@linaria/react';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import Jazzicon from 'jazzicon';

const Wrapper = styled.div`
  display: flex;
  width: 1rem;
  height: 1rem;
  margin: 0.2rem 0.2rem 0.2rem 0.1rem;

  border-radius: 1.125rem;
`;

interface Props {
  address: string | PublicKey;
  style?: React.CSSProperties;
  className?: string;
}

export const Identicon: FC<Props> = ({ address, style, className }) => {
  const customAddress = typeof address === 'string' ? address : address?.toBase58();
  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    if (address && ref.current) {
      ref.current.innerHTML = '';
      ref.current.className = className || '';
      ref.current.appendChild(
        Jazzicon(style?.width || 16, parseInt(bs58.decode(customAddress).toString('hex').slice(5, 15), 16))
      );
    }
  }, [address, customAddress, style, className]);

  return <Wrapper ref={ref as any} style={style} />;
};
