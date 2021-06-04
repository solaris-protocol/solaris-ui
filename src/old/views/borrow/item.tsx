import React from 'react';
import { Link } from 'react-router-dom';

import { PublicKey } from '@solana/web3.js';
import { Button } from 'antd';

import { useMidPriceInUSD } from '../../../app/contexts/market';
import { calculateBorrowAPY, Reserve } from '../../../app/models/lending';
import { TokenIcon } from '../../../components/common/TokenIcon';
import { LABELS } from '../../../constants';
import { useBorrowingPower, useTokenName } from '../../../hooks';
import { formatNumber, formatPct } from '../../../utils/utils';

export const BorrowItem = (props: { reserve: Reserve; address: PublicKey }) => {
  const name = useTokenName(props.reserve.liquidity.mintPubkey);
  const price = useMidPriceInUSD(props.reserve.liquidity.mintPubkey.toBase58()).price;

  const { borrowingPower, totalInQuote } = useBorrowingPower(props.address);

  const apr = calculateBorrowAPY(props.reserve);

  return (
    <Link to={`/borrow/${name}`}>
      <div className="borrow-item">
        <span style={{ display: 'flex' }}>
          <TokenIcon mintAddress={props.reserve.liquidity.mintPubkey} />
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
            <span>{LABELS.BORROW_ACTION}</span>
          </Button>
        </div>
      </div>
    </Link>
  );
};
