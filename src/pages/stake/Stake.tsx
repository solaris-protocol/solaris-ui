import React, { FC, useMemo, useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { TotalInfo } from 'components/common/TotalInfo';
import { ReDelegate } from 'components/pages/stake/ReDelegate';
import { SLSSOLCard } from 'components/pages/stake/stakeCards/SLSSOLCard';
import { SOLCard } from 'components/pages/stake/stakeCards/SOLCard';

const Content = styled.div`
  display: flex;
  flex-wrap: wrap;
  grid-gap: 20px;
  margin-top: 20px;

  color: #fff;
`;

const Left = styled.div`
  display: grid;
  grid-gap: 20px;
  width: 100%;
  max-width: 500px;
`;

export const Stake: FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const columns = useMemo(() => {
    return [
      { title: 'APY', value: `~7%` },
      { title: 'FEE', value: `3%` },
      { title: 'TOTAL STAKED', value: `85K` },
      { title: 'EPOCH', value: `$202` }, // TODO: epoch progress line
      { title: 'Validators', value: `$1,000` },
    ];
  }, []);

  return (
    <>
      <TotalInfo type="stake" columns={columns} /* TODO: milestone goal */ className={classNames({ isLoading })} />
      <Content>
        <Left>
          <ReDelegate />
          <SOLCard />
          <SLSSOLCard />
        </Left>
        <div>1</div>
      </Content>
    </>
  );
};
