import React, { FC, useEffect, useMemo, useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { TotalInfo } from 'components/common/TotalInfo';
import { DepositCard } from 'components/pages/deposit/DepositCard';
import { useReserves, useUserObligations } from 'hooks';
import { formatNumber } from 'utils/utils';

const CardsWrapper = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fill, 417px);

  margin-top: 20px;
`;

export const Deposit: FC = () => {
  const { reserveAccounts } = useReserves();
  const { totalDepositedValue } = useUserObligations();

  const [isLoading, setIsLoading] = useState(false);

  const columns = useMemo(() => {
    return [{ title: 'Deposited', value: `$${formatNumber.format(totalDepositedValue)}` }];
  }, [totalDepositedValue]);

  return (
    <>
      <TotalInfo type="deposit" columns={columns} className={classNames({ isLoading })} />
      <CardsWrapper>
        {reserveAccounts.map((account) => (
          <DepositCard
            key={account.pubkey.toBase58()}
            reserve={account}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ))}
      </CardsWrapper>
    </>
  );
};
