import { AccountInfo, PublicKey } from '@solana/web3.js';
import * as BufferLayout from 'buffer-layout';

import * as Layout from 'utils/layout';

export const LendingMarketLayout: typeof BufferLayout.Structure = BufferLayout.struct([
  BufferLayout.u8('version'),
  BufferLayout.u8('bumpSeed'),
  Layout.publicKey('owner'),
  Layout.publicKey('quoteTokenMint'),
  Layout.publicKey('tokenProgramId'),

  // extra space for future contract changes
  BufferLayout.blob(128, 'padding'),
]);

export interface LendingMarket {
  version: number;
  bumpSeed: number;
  owner: PublicKey;
  quoteTokenMint: PublicKey;
  tokenProgramId: PublicKey;
}

export const isLendingMarket = (info: AccountInfo<Buffer>) => {
  return info.data.length === LendingMarketLayout.span;
};

export const LendingMarketParser = (pubKey: PublicKey, info: AccountInfo<Buffer>) => {
  const buffer = Buffer.from(info.data);
  const data = LendingMarketLayout.decode(buffer);

  const details = {
    pubkey: pubKey,
    account: {
      ...info,
    },
    info: data,
  };

  return details;
};
