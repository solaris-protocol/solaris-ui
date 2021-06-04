import React, { useMemo } from 'react';

import { Statistic } from 'antd';

import { useMint } from '../../../app/contexts/accounts';
import { Reserve } from '../../../app/models/lending';
import { formatNumber, fromLamports, isSmallNumber, wadToLamports } from '../../../utils/utils';
import { WaterWave } from '../WaterWave';

export const ReserveUtilizationChart = (props: { reserve: Reserve }) => {
  const mintAddress = props.reserve.liquidity.mintPubkey?.toBase58();
  const liquidityMint = useMint(mintAddress);
  const availableLiquidity = fromLamports(props.reserve.liquidity.availableAmount, liquidityMint);

  const totalBorrows = useMemo(
    () => fromLamports(wadToLamports(props.reserve.liquidity.borrowedAmountWads), liquidityMint),
    [props.reserve, liquidityMint]
  );

  const totalSupply = availableLiquidity + totalBorrows;
  const percent = (100 * totalBorrows) / totalSupply;

  return (
    <WaterWave
      style={{ height: 300 }}
      showPercent={false}
      title={
        <Statistic
          title="Utilization"
          suffix="%"
          value={formatNumber.format(percent, true)}
          precision={3}
          prefix={isSmallNumber(percent) ? '<' : ''}
        />
      }
      percent={percent}
    />
  );
};
