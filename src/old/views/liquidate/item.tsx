import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Button } from 'antd';

import { cache, ParsedAccount, useMint } from '../../../app/contexts/accounts';
import { calculateBorrowAPY, collateralToLiquidity, Reserve } from '../../../app/models/lending';
import { TokenIcon } from '../../../components/common/TokenIcon';
import { LABELS } from '../../../constants';
import { EnrichedLendingObligation, useTokenName } from '../../../hooks';
import { formatNumber, formatPct, fromLamports, wadToLamports } from '../../../utils/utils';

export const LiquidateItem = (props: { item: EnrichedLendingObligation }) => {
  const obligation = props.item.info;

  const borrowReserve = cache.get(obligation.borrowReserve) as ParsedAccount<Reserve>;

  const collateralReserve = cache.get(obligation.collateralReserve) as ParsedAccount<Reserve>;

  const liquidityMint = useMint(borrowReserve.info.liquidity.mintPubkey);
  const collateralMint = useMint(collateralReserve.info.liquidity.mintPubkey);

  const borrowAmount = fromLamports(wadToLamports(obligation.borrowAmountWad), liquidityMint);

  const borrowAPY = useMemo(() => calculateBorrowAPY(borrowReserve.info), [borrowReserve]);

  const collateralLamports = collateralToLiquidity(obligation.depositedCollateral, borrowReserve.info);
  const collateral = fromLamports(collateralLamports, collateralMint);

  const borrowName = useTokenName(borrowReserve?.info.liquidity.mintPubkey);
  const collateralName = useTokenName(collateralReserve?.info.liquidity.mintPubkey);

  return (
    <Link to={`/liquidate/${props.item.account.pubkey.toBase58()}`}>
      <div className="liquidate-item">
        <span style={{ display: 'flex' }}>
          <div style={{ display: 'flex' }}>
            <TokenIcon mintAddress={collateralReserve?.info.liquidity.mintPubkey} style={{ marginRight: '-0.5rem' }} />
            <TokenIcon mintAddress={borrowReserve?.info.liquidity.mintPubkey} />
          </div>
          {collateralName}→{borrowName}
        </span>
        <div>
          <div>
            <div>
              <em>{formatNumber.format(borrowAmount)}</em> {borrowName}
            </div>
            <div className="dashboard-amount-quote">${formatNumber.format(obligation.borrowedInQuote)}</div>
          </div>
        </div>
        <div>
          <div>
            <div>
              <em>{formatNumber.format(collateral)}</em> {collateralName}
            </div>
            <div className="dashboard-amount-quote">${formatNumber.format(obligation.collateralInQuote)}</div>
          </div>
        </div>
        <div>{formatPct.format(borrowAPY)}</div>
        <div>{formatPct.format(obligation.ltv / 100)}</div>
        <div>{obligation.health.toFixed(2)}</div>
        <div>
          <Button type="primary">
            <span>{LABELS.LIQUIDATE_ACTION}</span>
          </Button>
        </div>
      </div>
    </Link>
  );
};
