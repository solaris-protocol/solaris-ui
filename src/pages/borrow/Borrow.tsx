import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { TotalInfo } from 'components/common/TotalInfo';
import { BorrowCard } from 'components/pages/borrow/BorrowCard';
// import { useLendingReserves, useUserObligations } from 'hooks';

const CardsWrapper = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fill, 417px);

  margin-top: 20px;
`;

export const Borrow: FC = () => {
  // const { userObligations } = useUserObligations();

  return (
    <>
      <TotalInfo type="borrow" />
      <CardsWrapper>
        <BorrowCard key="1" />
        {/*{userObligations.map((item) => (*/}
        {/*  <BorrowCard key={item.obligation.account.pubkey.toBase58()} obligation={item.obligation} />*/}
        {/*))}*/}
      </CardsWrapper>
    </>
  );
};
