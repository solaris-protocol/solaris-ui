import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Button } from 'antd';

import { calculateDepositAPY } from '../../../../app/models/lending';
import { TokenIcon } from '../../../../components/common/TokenIcon';
import { LABELS } from '../../../../constants';
import { UserDeposit, useTokenName } from '../../../../hooks';
import { formatNumber, formatPct } from '../../../../utils/utils';

export const DepositItem = (props: { userDeposit: UserDeposit }) => {
  const { reserve, info } = props.userDeposit;
  const mintAddress = reserve.info.liquidity.mintPubkey;
  const name = useTokenName(mintAddress);

  const depositAPY = useMemo(() => calculateDepositAPY(reserve.info), [reserve]);

  return (
    <div className="dashboard-item">
      <span style={{ display: 'flex' }}>
        <TokenIcon mintAddress={mintAddress} />
        {name}
      </span>
      <div>
        <div>
          <div>
            <em>{formatNumber.format(info.amount)}</em> {name}
          </div>
          <div className="dashboard-amount-quote">${formatNumber.format(info.amountInQuote)}</div>
        </div>
      </div>
      <div>{formatPct.format(depositAPY)}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Link to={`/deposit/${name}`}>
          <Button type="primary">
            <span>{LABELS.DEPOSIT_ACTION}</span>
          </Button>
        </Link>
        <Link to={`/withdraw/${name}`}>
          <Button type="text">
            <span>{LABELS.WITHDRAW_ACTION}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
