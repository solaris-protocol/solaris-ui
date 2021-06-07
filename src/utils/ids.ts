import { PublicKey } from '@solana/web3.js';

import { TokenSwapLayout, TokenSwapLayoutV1 } from 'app/models';

export const WRAPPED_SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

export let LENDING_PROGRAM_ID = new PublicKey('6h5geweHee42FbxZrYAcYJ8SGVAjG6sGow5dtzcKtrJw');

let SWAP_PROGRAM_ID: PublicKey;
let SWAP_PROGRAM_LEGACY_IDS: PublicKey[];
let SWAP_PROGRAM_LAYOUT: any;

export const LEND_HOST_FEE_ADDRESS = process.env.REACT_APP_LEND_HOST_FEE_ADDRESS
  ? new PublicKey(`${process.env.REACT_APP_LEND_HOST_FEE_ADDRESS}`)
  : undefined;

console.debug(`Lend host fee address: ${LEND_HOST_FEE_ADDRESS?.toBase58()}`);

export const ENABLE_FEES_INPUT = false;

// legacy pools are used to show users contributions in those pools to allow for withdrawals of funds
export const PROGRAM_IDS = [
  {
    name: 'mainnet-beta',
    swap: () => ({
      current: {
        pubkey: new PublicKey('9qvG1zUp8xF1Bi4m6UdRNby1BAAuaDrUxSpv4CmRRMjL'),
        layout: TokenSwapLayoutV1,
      },
      legacy: [
        // TODO: uncomment to enable legacy contract
        // new PublicKey("9qvG1zUp8xF1Bi4m6UdRNby1BAAuaDrUxSpv4CmRRMjL"),
      ],
    }),
  },
  {
    name: 'testnet',
    swap: () => ({
      current: {
        pubkey: new PublicKey('2n2dsFSgmPcZ8jkmBZLGUM2nzuFqcBGQ3JEEj6RJJcEg'),
        layout: TokenSwapLayoutV1,
      },
      legacy: [],
    }),
  },
  {
    name: 'devnet',
    swap: () => ({
      current: {
        pubkey: new PublicKey('6Cust2JhvweKLh4CVo1dt21s2PJ86uNGkziudpkNPaCj'),
        layout: TokenSwapLayout,
      },
      legacy: [new PublicKey('BSfTAcBdqmvX5iE2PW88WFNNp2DHhLUaBKk5WrnxVkcJ')],
    }),
  },
  {
    name: 'localnet',
    swap: () => ({
      current: {
        pubkey: new PublicKey('369YmCWHGxznT7GGBhcLZDRcRoGWmGKFWdmtiPy78yj7'),
        layout: TokenSwapLayoutV1,
      },
      legacy: [],
    }),
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

  const swap = instance.swap();

  SWAP_PROGRAM_ID = swap.current.pubkey;
  SWAP_PROGRAM_LAYOUT = swap.current.layout;
  SWAP_PROGRAM_LEGACY_IDS = swap.legacy;
};

export const programIds = () => {
  return {
    token: TOKEN_PROGRAM_ID,
    swap: SWAP_PROGRAM_ID,
    swapLayout: SWAP_PROGRAM_LAYOUT,
    swap_legacy: SWAP_PROGRAM_LEGACY_IDS,
    lending: LENDING_PROGRAM_ID,
  };
};
