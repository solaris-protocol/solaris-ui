import React, { FC, useMemo } from 'react';

import { styled } from '@linaria/react';

import { TotalInfo } from 'components/common/TotalInfo';
import { DepositCard } from 'components/pages/deposit/DepositCard';
import { useLendingReserves, useUserDeposits, useUserObligations } from 'hooks';
import { formatNumber } from 'utils/utils';

const CardsWrapper = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fill, 417px);

  margin-top: 20px;
`;

export const Deposit: FC = () => {
  const { reserveAccounts } = useLendingReserves();
  // const { collateralInQuote, borrowedInQuote } = useUserObligations();
  const { totalInQuote } = useUserDeposits();

  console.log(
    333,
    reserveAccounts.map((r) => r.pubkey.toBase58())
  );

  // console.log(111, collateralInQuote, borrowedInQuote);

  const columns = useMemo(() => {
    return [{ title: 'Deposited', value: `$${formatNumber.format(totalInQuote)}` }];
  }, [totalInQuote]);

  return (
    <>
      <TotalInfo type="deposit" columns={columns} />
      <CardsWrapper>
        {reserveAccounts.map((account) => (
          <DepositCard key={account.pubkey.toBase58()} reserve={account.info} address={account.pubkey} />
        ))}
      </CardsWrapper>
    </>
  );
};
