// https://github.com/solana-labs/oyster/blob/aeadf50cd5a50527dd7657bd0e28aa507bab98ae/packages/lending/src/actions/helpers/refreshObligationAndReserves.tsx

import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';

import { cache, ParsedAccount } from 'app/contexts/accounts';
import { refreshObligationInstruction, refreshReserveInstruction, Reserve, ReserveParser } from 'app/models';
import { EnrichedLendingObligation } from 'hooks';

export const refreshObligationAndReserves = async (connection: Connection, obligation: EnrichedLendingObligation) => {
  const instructions = [] as TransactionInstruction[];
  const reserves = {} as Record<string, PublicKey>;

  for (const collateral of obligation.info.deposits) {
    reserves[collateral.depositReserve.toBase58()] = collateral.depositReserve;
  }
  for (const liquidity of obligation.info.borrows) {
    reserves[liquidity.borrowReserve.toBase58()] = liquidity.borrowReserve;
  }

  await Promise.all(
    Object.values(reserves).map(async (pubkey) => {
      const reserve = (await cache.query(connection, pubkey, ReserveParser)) as ParsedAccount<Reserve>;

      instructions.push(refreshReserveInstruction(pubkey, reserve.info.liquidity.oraclePubkey));
    })
  );

  instructions.push(
    refreshObligationInstruction(
      obligation.account.pubkey,
      obligation.info.deposits.map((collateral) => collateral.depositReserve),
      obligation.info.borrows.map((liquidity) => liquidity.borrowReserve)
    )
  );

  return instructions;
};
