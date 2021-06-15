import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { TotalInfo } from 'components/common/TotalInfo';
import { BorrowCard } from 'components/pages/borrow/BorrowCard';
import { useLendingReserves } from 'hooks';

const CardsWrapper = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fill, 417px);

  margin-top: 20px;
`;

export const Borrow: FC = () => {
  const { reserveAccounts } = useLendingReserves();

  return (
    <>
      <TotalInfo type="borrow" columns={[]} />
      <CardsWrapper>
        {reserveAccounts.map((account) => (
          <BorrowCard key={account.pubkey.toBase58()} reserve={account.info} />
        ))}
      </CardsWrapper>
    </>
  );
};
