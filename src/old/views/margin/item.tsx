import React from 'react';
import { Link } from 'react-router-dom';

import { PublicKey } from '@solana/web3.js';
import { Button } from 'antd';

import { useMidPriceInUSD } from '../../../app/contexts/market';
import { calculateBorrowAPY, LendingReserve } from '../../../app/models/lending';
import { TokenIcon } from '../../../components/common/TokenIcon';
import { LABELS } from '../../../constants';
import { useBorrowingPower, useTokenName } from '../../../hooks';
import { formatNumber, formatPct } from '../../../utils/utils';

export const MarginTradeItem = (props: { reserve: LendingReserve; address: PublicKey }) => {
  const name = useTokenName(props.reserve.liquidityMint);
  const price = useMidPriceInUSD(props.reserve.liquidityMint.toBase58()).price;

  const apr = calculateBorrowAPY(props.reserve);

  // TODO: specifc max leverage
  const { totalInQuote, borrowingPower } = useBorrowingPower(props.address, false, false);

  return (
    <Link to={`/margin/${props.address.toBase58()}`}>
      <div className="choose-margin-item">
        <span style={{ display: 'flex' }}>
          <TokenIcon mintAddress={props.reserve.liquidityMint} />
          {name}
        </span>
        <div>${formatNumber.format(price)}</div>
        <div>
          <div>
            <div>
              <em>{formatNumber.format(borrowingPower)}</em> {name}
            </div>
            <div className="dashboard-amount-quote">${formatNumber.format(totalInQuote)}</div>
          </div>
        </div>
        <div>{formatPct.format(apr)}</div>
        <div>
          <Button type="primary">
            <span>{LABELS.MARGIN_TRADE_ACTION}</span>
          </Button>
        </div>
      </div>
    </Link>
  );
};
