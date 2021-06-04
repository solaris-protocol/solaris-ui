import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { PublicKey } from '@solana/web3.js';

import { useMint } from '../../../app/contexts/accounts';
import { TotalItem } from '../../../app/models';
import { calculateBorrowAPY, calculateDepositAPY, Reserve } from '../../../app/models/lending';
import { TokenIcon } from '../../../components/common/TokenIcon';
import { useTokenName } from '../../../hooks';
import { formatNumber, formatPct, fromLamports, wadToLamports } from '../../../utils/utils';

export const LendingReserveItem = (props: { reserve: Reserve; address: PublicKey; item?: TotalItem }) => {
  const name = useTokenName(props.reserve.liquidity.mintPubkey);

  const liquidityMint = useMint(props.reserve.liquidity.mintPubkey);

  const availableLiquidity = fromLamports(props.reserve.liquidity.availableAmount, liquidityMint);

  const totalBorrows = useMemo(
    () => fromLamports(wadToLamports(props.reserve.liquidity.borrowedAmountWads), liquidityMint),
    [props.reserve, liquidityMint]
  );

  const borrowAPY = useMemo(() => calculateBorrowAPY(props.reserve), [props.reserve]);

  const depositAPY = useMemo(() => calculateDepositAPY(props.reserve), [props.reserve]);

  const marketSize = availableLiquidity + totalBorrows;

  return (
    <Link to={`/reserve/${props.address.toBase58()}`}>
      <div className="home-item">
        <span style={{ display: 'flex' }}>
          <TokenIcon mintAddress={props.reserve.liquidity.mintPubkey} />
          {name}
        </span>
        <div title={marketSize.toString()}>
          <div>
            <div>
              <em>{formatNumber.format(marketSize)}</em> {name}
            </div>
            <div className="dashboard-amount-quote">${formatNumber.format(props.item?.marketSize)}</div>
          </div>
        </div>
        <div title={totalBorrows.toString()}>
          <div>
            <div>
              <em>{formatNumber.format(totalBorrows)}</em> {name}
            </div>
            <div className="dashboard-amount-quote">${formatNumber.format(props.item?.borrowed)}</div>
          </div>
        </div>
        <div title={depositAPY.toString()}>{formatPct.format(depositAPY)}</div>
        <div title={borrowAPY.toString()}>{formatPct.format(borrowAPY)}</div>
      </div>
    </Link>
  );
};
