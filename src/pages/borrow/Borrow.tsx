import React, { FC, useMemo } from 'react';

import { styled } from '@linaria/react';

import { TotalInfo } from 'components/common/TotalInfo';
import { BorrowCard } from 'components/pages/borrow/BorrowCard';
import { useReserves, useUserObligations } from 'hooks';
import { formatNumber } from 'utils/utils';

const CardsWrapper = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(417px, 1fr));

  margin-top: 20px;
`;

export const Borrow: FC = () => {
  const { reserveAccounts } = useReserves();
  const { totalBorrowedValue } = useUserObligations();

  const columns = useMemo(() => {
    return [{ title: 'Borrowed', value: `$${formatNumber.format(totalBorrowedValue)}` }];
  }, [totalBorrowedValue]);

  return (
    <>
      <TotalInfo type="borrow" columns={columns} />
      <CardsWrapper>
        {reserveAccounts.map((account) => (
          <BorrowCard key={account.pubkey.toBase58()} reserve={account} />
        ))}
      </CardsWrapper>
    </>
  );
};
