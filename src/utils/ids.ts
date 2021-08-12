import { PublicKey } from '@solana/web3.js';

export const WRAPPED_SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const PYTH_PROGRAM_ID = new PublicKey('BmA9Z6FjioHJPpjT39QazZyhDRUdZy2ezwx4GiDdE2u2'); // ArppEFcsybCLE8CRtQJLQ9tLv2peGmQoKWFuiUWm4KBP

export let LENDING_PROGRAM_ID = new PublicKey('6h5geweHee42FbxZrYAcYJ8SGVAjG6sGow5dtzcKtrJw');

export const LEND_HOST_FEE_ADDRESS = process.env.REACT_APP_LEND_HOST_FEE_ADDRESS
  ? new PublicKey(`${process.env.REACT_APP_LEND_HOST_FEE_ADDRESS}`)
  : undefined;

console.debug(`Lend host fee address: ${LEND_HOST_FEE_ADDRESS?.toBase58()}`);

export const ENABLE_FEES_INPUT = false;

// legacy pools are used to show users contributions in those pools to allow for withdrawals of funds
export const PROGRAM_IDS = [
  {
    name: 'mainnet-beta',
  },
  {
    name: 'testnet',
  },
  {
    name: 'devnet',
  },
  {
    name: 'localnet',
  },
];

export const setProgramIds = (envName: string) => {
  if (envName === 'devnet') {
    LENDING_PROGRAM_ID = new PublicKey('6h5geweHee42FbxZrYAcYJ8SGVAjG6sGow5dtzcKtrJw');
  } else {
    throw new Error('only devnet supported currently');
  }

  const instance = PROGRAM_IDS.find((env) => env.name === envName);
  if (!instance) {
    return;
  }
};

export const programIds = () => {
  return {
    token: TOKEN_PROGRAM_ID,
    lending: LENDING_PROGRAM_ID,
  };
};
