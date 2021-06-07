import { ENV as ChainID } from '@solana/spl-token-registry';
import { clusterApiUrl } from '@solana/web3.js';

import { ENV } from 'app/contexts/connection';

export const ENDPOINTS = [
  // {
  //   name: 'mainnet-beta' as ENV,
  //   endpoint: 'https://solana-api.projectserum.com/',
  // },
  // { name: 'testnet' as ENV, endpoint: clusterApiUrl('testnet') },
  { name: 'devnet' as ENV, endpoint: clusterApiUrl('devnet'), chainID: ChainID.MainnetBeta },
  // { name: 'localnet' as ENV, endpoint: 'http://127.0.0.1:8899' },
];
