import { ENV as ChainId } from '@solana/spl-token-registry';
import { Cluster, clusterApiUrl } from '@solana/web3.js';

export type ENV = Cluster | 'localnet';

export type EndpointType = {
  env: ENV;
  chainId: ChainId;
  endpoint: string;
};

export const ENDPOINTS: EndpointType[] = [
  // {
  //   env: 'mainnet-beta' as ENV,
  //   endpoint: 'https://solana-api.projectserum.com/',
  // },
  // { env: 'testnet' as ENV, endpoint: clusterApiUrl('testnet') },
  // TODO: devnet
  { env: 'devnet' as ENV, chainId: ChainId.Devnet, endpoint: clusterApiUrl('devnet') },
  // { env: 'localnet' as ENV, endpoint: 'http://127.0.0.1:8899' },
];
