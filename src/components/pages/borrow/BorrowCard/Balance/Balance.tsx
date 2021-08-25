import React, { FC, useMemo } from 'react';

import { styled } from '@linaria/react';

import { ParsedAccount, useMint } from 'app/contexts/accounts/accounts';
import { usePrice } from 'app/contexts/pyth';
import { Reserve } from 'app/models';
import { Button } from 'components/common/Button';
import { ButtonConnect } from 'components/common/ButtonConnect';
import { CollateralBalance } from 'components/common/CollateralBalance';
import { calculateCollateralBalance, useUserObligations } from 'hooks';
import { useMaxBorrowValueInLiquidity } from 'hooks/lending/useMaxBorrowValueInLiquidity';
import { fromLamports, wadToLamports } from 'utils/utils';

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
  const price = usePrice(reserve?.info.liquidity.mintPubkey.toBase58() || '');

  const obligation = userObligations[0]?.obligation || null;
  const borrowReserve = obligation
    ? obligation.info.borrows.find((deposit) => deposit.borrowReserve.equals(reserve.pubkey))
    : null;

  const { collateralBalanceInLiquidity, collateralBalanceInLiquidityInUSD } = useMemo(() => {
    const collateralBalanceLamports = borrowReserve
      ? calculateCollateralBalance(reserve.info, wadToLamports(borrowReserve.borrowedAmountWads).toNumber())
      : 0;
    const collateralBalanceInLiquidity = borrowReserve ? fromLamports(collateralBalanceLamports, mintInfo) : 0;
    const collateralBalanceInLiquidityInUSD = collateralBalanceInLiquidity * price;

    return { collateralBalanceInLiquidity, collateralBalanceInLiquidityInUSD };
  }, [borrowReserve, mintInfo, price, reserve]);

  const maxBorrowValueInLiquidity = useMaxBorrowValueInLiquidity(reserve, obligation);

  const preparedWithdrawTooltip = useMemo(() => {
    if (!collateralBalanceInLiquidity) {
      return 'To be able to borrow, you need deposit first';
    }

    if (!maxBorrowValueInLiquidity) {
      return 'To be able to borrow, you need deposit more liquidity';
    }
  }, [collateralBalanceInLiquidity, maxBorrowValueInLiquidity]);

  const isBorrowDisabled = !maxBorrowValueInLiquidity || !obligation;

  return (
    <>
      <CollateralBalanceWrapper>
        <CollateralBalance balance={collateralBalanceInLiquidity} balanceInUSD={collateralBalanceInLiquidityInUSD} />
      </CollateralBalanceWrapper>
      <Bottom>
        <ButtonConnect>
          <Button
            disabled={isBorrowDisabled}
            aria-label={preparedWithdrawTooltip}
            onClick={() => setState('borrow')}
            className="full"
          >
            Borrow
          </Button>
          {collateralBalanceInLiquidity ? (
            <Button onClick={() => setState('repay')} className="full">
              Repay
            </Button>
          ) : null}
        </ButtonConnect>
      </Bottom>
    </>
  );
};
