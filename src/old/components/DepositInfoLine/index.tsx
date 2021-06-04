import './style.less';

import React, { useMemo } from 'react';

import { PublicKey } from '@solana/web3.js';
import { Card, Col, Row, Statistic } from 'antd';

import { calculateDepositAPY, Reserve } from '../../../app/models/lending';
import { GUTTER } from '../../../constants';
import { useTokenName, useUserBalance, useUserCollateralBalance } from '../../../hooks';
import { formatNumber, formatPct } from '../../../utils/utils';

export const DepositInfoLine = (props: { className?: string; reserve: Reserve; address: PublicKey }) => {
  const name = useTokenName(props.reserve.liquidity.mintPubkey);
  const { balance: tokenBalance } = useUserBalance(props.reserve.liquidity.mintPubkey);
  const { balance: collateralBalance } = useUserCollateralBalance(props.reserve);
  const depositAPY = useMemo(() => calculateDepositAPY(props.reserve), [props.reserve]);

  return (
    <Row gutter={GUTTER}>
      <Col xs={24} xl={5}>
        <Card className={props.className}>
          <Statistic title="Your balance in Oyster" value={formatNumber.format(collateralBalance)} suffix={name} />
        </Card>
      </Col>
      <Col xs={24} xl={5}>
        <Card className={props.className}>
          <Statistic title="Your wallet balance" value={formatNumber.format(tokenBalance)} suffix={name} />
        </Card>
      </Col>
      <Col xs={24} xl={5}>
        <Card className={props.className}>
          <Statistic title="Health Factor" value="--" />
        </Card>
      </Col>
      <Col xs={24} xl={9}>
        <Card className={props.className}>
          <Statistic title="APY" value={formatPct.format(depositAPY)} />
        </Card>
      </Col>
    </Row>
  );
};
