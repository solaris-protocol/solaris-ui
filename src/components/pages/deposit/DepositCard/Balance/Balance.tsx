import React, { FC, useMemo } from 'react';

import { styled } from '@linaria/react';

import { ParsedAccount, useMint } from 'app/contexts/accounts';
import { usePrice } from 'app/contexts/pyth';
import { Reserve } from 'app/models';
import { Button } from 'components/common/Button';
import { ButtonConnect } from 'components/common/ButtonConnect';
import { CollateralBalance } from 'components/common/CollateralBalance';
import { calculateCollateralBalance, useUserObligations } from 'hooks';
import { fromLamports } from 'utils/utils';

import { Bottom } from '../common/styled';
import { StateType } from '../types';

const CollateralBalanceWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;

  text-align: center;
`;

interface Props {
  reserve: ParsedAccount<Reserve>;
  setState: (state: StateType) => void;
}

export const Balance: FC<Props> = ({ reserve, setState }) => {
  const { userObligations } = useUserObligations();
  const mintInfo = useMint(reserve.info.collateral.mintPubkey);
  const price = usePrice(reserve.info.liquidity.mintPubkey.toBase58() || '');

  const obligation = userObligations[0]?.obligation || null;
  const depositReserve = obligation
    ? obligation.info.deposits.find((deposit) => deposit.depositReserve.equals(reserve.pubkey))
    : null;

  const { collateralBalanceInLiquidity, collateralBalanceInLiquidityInUSD } = useMemo(() => {
    const collateralBalanceLamports = depositReserve
      ? calculateCollateralBalance(reserve.info, depositReserve.depositedAmount.toNumber())
      : 0;
    const collateralBalanceInLiquidity = depositReserve ? fromLamports(collateralBalanceLamports, mintInfo) : 0;
    const collateralBalanceInLiquidityInUSD = collateralBalanceInLiquidity * price;
    return { collateralBalanceInLiquidity, collateralBalanceInLiquidityInUSD };
  }, [depositReserve, mintInfo, price, reserve]);

  return (
    <>
      <CollateralBalanceWrapper>
        <CollateralBalance balance={collateralBalanceInLiquidity} balanceInUSD={collateralBalanceInLiquidityInUSD} />
      </CollateralBalanceWrapper>
      <Bottom>
        <ButtonConnect>
          <Button onClick={() => setState('deposit')} className="full">
            Deposit
          </Button>
          <Button onClick={() => setState('withdraw')} className="full">
            Withdraw
          </Button>
        </ButtonConnect>
      </Bottom>
    </>
  );
};
