import React from 'react';
import { Link } from 'react-router-dom';

import { PublicKey } from '@solana/web3.js';
import { Button } from 'antd';

import { calculateDepositAPY, Reserve } from '../../../../app/models/lending';
import { TokenIcon } from '../../../../components/common/TokenIcon';
import { LABELS } from '../../../../constants';
import { useTokenName, useUserBalance, useUserCollateralBalance } from '../../../../hooks';
import { formatNumber, formatPct } from '../../../../utils/utils';

export const ReserveItem = (props: { reserve: Reserve; address: PublicKey }) => {
  const name = useTokenName(props.reserve.liquidity.mintPubkey);
  const { balance: tokenBalance, balanceInUSD: tokenBalanceInUSD } = useUserBalance(props.reserve.liquidity.mintPubkey);
  const { balance: collateralBalance, balanceInUSD: collateralBalanceInUSD } = useUserCollateralBalance(props.reserve);

  const apy = calculateDepositAPY(props.reserve);

  return (
    <Link to={`/deposit/${name}`}>
      <div className="deposit-item">
        <span style={{ display: 'flex' }}>
          <TokenIcon mintAddress={props.reserve.liquidity.mintPubkey} />
          {name}
        </span>
        <div>
          <div>
            <div>
              <em>{formatNumber.format(tokenBalance)}</em> {name}
            </div>
            <div className="dashboard-amount-quote">${formatNumber.format(tokenBalanceInUSD)}</div>
          </div>
        </div>
        <div>
          <div>
            <div>
              <em>{formatNumber.format(collateralBalance)}</em> {name}
            </div>
            <div className="dashboard-amount-quote">${formatNumber.format(collateralBalanceInUSD)}</div>
          </div>
        </div>
        <div>{formatPct.format(apy)}</div>
        <div>
          <Button type="primary">
            <span>{LABELS.DEPOSIT_ACTION}</span>
          </Button>
        </div>
      </div>
    </Link>
  );
};
