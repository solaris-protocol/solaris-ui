import './style.less';

import React from 'react';
import { useMemo } from 'react';

import { PublicKey } from '@solana/web3.js';
import { Card, Col, Row, Statistic } from 'antd';

import { useMint } from '../../../app/contexts/accounts';
import { useMidPriceInUSD } from '../../../app/contexts/market';
import { calculateDepositAPY, Reserve } from '../../../app/models/lending';
import { TokenIcon } from '../../../components/common/TokenIcon';
import { GUTTER, LABELS } from '../../../constants';
import { feeFormatter, formatNumber, fromLamports, isSmallNumber, wadToLamports } from '../../../utils/utils';
import { ReserveUtilizationChart } from '../ReserveUtilizationChart';

export const ReserveStatus = (props: { className?: string; reserve: Reserve; address: PublicKey }) => {
  const bodyStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const mintAddress = props.reserve.liquidity.mintPubkey?.toBase58();
  const liquidityMint = useMint(mintAddress);
  const { price } = useMidPriceInUSD(mintAddress);
  const availableLiquidity = fromLamports(props.reserve.liquidity.availableAmount, liquidityMint);

  const availableLiquidityInUSD = price * availableLiquidity;

  const totalBorrows = useMemo(
    () => fromLamports(wadToLamports(props.reserve.liquidity.borrowedAmountWads), liquidityMint),
    [props.reserve, liquidityMint]
  );

  const totalBorrowsInUSD = price * totalBorrows;

  const depositAPY = useMemo(() => calculateDepositAPY(props.reserve), [props.reserve]);

  const liquidationThreshold = props.reserve.config.liquidationThreshold;
  const liquidationPenalty = props.reserve.config.liquidationBonus;
  const maxLTV = props.reserve.config.loanToValueRatio;

  return (
    <Card
      className={props.className}
      title={
        <>
          <TokenIcon
            style={{
              marginRight: 0,
              marginTop: 0,
              position: 'absolute',
              left: 15,
            }}
            mintAddress={mintAddress}
            size={30}
          />
          {LABELS.RESERVE_STATUS_TITLE}
        </>
      }
      bodyStyle={bodyStyle}
    >
      <div className="flexColumn">
        <Row gutter={GUTTER}>
          <Col span={12}>
            <Statistic
              title="Available Liquidity"
              value={availableLiquidity}
              valueRender={(node) => (
                <div>
                  {node}
                  <div className="dashboard-amount-quote-stat">${formatNumber.format(availableLiquidityInUSD)}</div>
                </div>
              )}
              precision={2}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Total Borrowed"
              value={totalBorrows}
              valueRender={(node) => (
                <div>
                  {node}
                  <div className="dashboard-amount-quote-stat">${formatNumber.format(totalBorrowsInUSD)}</div>
                </div>
              )}
              precision={2}
            />
          </Col>
        </Row>
        <Row gutter={GUTTER}>
          <Col
            span={24}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
            }}
          >
            <ReserveUtilizationChart reserve={props.reserve} />
          </Col>
        </Row>
        <Row gutter={GUTTER}>
          <Col span={6}>
            <Statistic title={LABELS.MAX_LTV} className="small-statisitc" value={maxLTV} precision={2} suffix="%" />
          </Col>
          <Col span={6}>
            <Statistic
              title={LABELS.LIQUIDATION_THRESHOLD}
              className="small-statisitc"
              value={liquidationThreshold}
              precision={2}
              suffix="%"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={LABELS.LIQUIDATION_PENALTY}
              className="small-statisitc"
              value={liquidationPenalty}
              precision={2}
              suffix="%"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={LABELS.TABLE_TITLE_DEPOSIT_APY}
              className="small-statisitc"
              value={formatNumber.format(depositAPY * 100, true)}
              precision={3}
              prefix={isSmallNumber(depositAPY * 100) ? '<' : ''}
              suffix="%"
            />
          </Col>
        </Row>
      </div>
    </Card>
  );
};
