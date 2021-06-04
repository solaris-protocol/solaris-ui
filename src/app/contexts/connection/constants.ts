import { clusterApiUrl } from '@solana/web3.js';

import { ENV } from 'app/contexts/connection';

export const ENDPOINTS = [
  // {
  //   name: 'mainnet-beta' as ENV,
  //   endpoint: 'https://solana-api.projectserum.com/',
  // },
  // {
  //   name: 'Oyster Dev' as ENV,
  //   endpoint: 'http://oyster-dev.solana.com/',
  // },
  // {
  //   name: 'Lending' as ENV,
  //   endpoint: 'https://tln.solana.com/',
  // },
  // { name: 'testnet' as ENV, endpoint: clusterApiUrl('testnet') },
  { name: 'devnet' as ENV, endpoint: clusterApiUrl('devnet') },
  // { name: 'localnet' as ENV, endpoint: 'http://127.0.0.1:8899' },
];
