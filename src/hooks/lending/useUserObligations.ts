import { useMemo } from 'react';

import { useWallet } from 'app/contexts/wallet';
import { useObligations } from 'hooks';
import { wadToLamports } from 'utils/utils';

export function useUserObligations() {
  const { wallet } = useWallet();
  const { obligations } = useObligations();

  const userObligations = useMemo(() => {
    if (!wallet?.publicKey) {
      return [];
    }

    return obligations
      .filter((acc) => wallet.publicKey?.equals(acc.info.owner))
      .map((obligation) => ({ obligation }))
      .sort((a, b) => b.obligation.info.borrowedValue.sub(a.obligation.info.borrowedValue).toNumber());
  }, [obligations, wallet?.publicKey]);

  return {
    userObligations,
    totalDepositedValue: userObligations.reduce(
      (result, item) => result + wadToLamports(item.obligation.info.depositedValue).toNumber() / 10 ** 6, // TODO: find out why we need to div it to 6 decimsla
      0
    ),
    totalBorrowedValue: userObligations.reduce(
      (result, item) => result + wadToLamports(item.obligation.info.borrowedValue).toNumber() / 10 ** 6, // TODO: find out why we need to div it to 6 decimsla
      0
    ),
  };
}

export const useUserObligation = (address: string) => {
  const userObligations = useUserObligations();
  return userObligations.userObligations.find((obligation) => obligation.obligation.pubkey.toBase58() === address);
};
