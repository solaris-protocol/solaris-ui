import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { TotalInfo } from 'components/common/TotalInfo';
import { DepositCard } from 'components/pages/deposit/DepositCard';
import { useLendingReserves } from 'hooks';

const CardsWrapper = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fill, 417px);

  margin-top: 20px;
`;

export const Deposit: FC = () => {
  const { reserveAccounts } = useLendingReserves();

  return (
    <>
      <TotalInfo type="deposit" />
      <CardsWrapper>
        {reserveAccounts.map((account) => (
          <DepositCard key={account.pubkey.toBase58()} reserve={account.info} />
        ))}
      </CardsWrapper>
    </>
  );
};
