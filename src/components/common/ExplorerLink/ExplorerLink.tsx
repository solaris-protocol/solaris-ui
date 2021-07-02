import React from 'react';

import { Connection, PublicKey } from '@solana/web3.js';
import { Typography } from 'antd';

import { useConnectionConfig } from 'app/contexts/connection';
import { getExplorerUrl } from 'utils/explorer';
import { shortenAddress } from 'utils/utils';

export const ExplorerLink = (props: {
  address: string | PublicKey;
  type: string;
  code?: boolean;
  style?: React.CSSProperties;
  length?: number;
  short?: boolean;
  connection?: Connection;
}) => {
  const { type, code, short } = props;
  const { endpoint } = useConnectionConfig();

  const address = typeof props.address === 'string' ? props.address : props.address?.toBase58();

  if (!address) {
    return null;
  }

  const displayAddress = short || props.length ? shortenAddress(address, props.length ?? 9) : address;

  return (
    <a
      href={getExplorerUrl(address, endpoint, type, props.connection)}
      target="_blank"
      title={address}
      style={props.style}
      rel="noreferrer"
    >
      {code ? (
        <Typography.Text style={props.style} code>
          {displayAddress}
        </Typography.Text>
      ) : (
        displayAddress
      )}
    </a>
  );
};
