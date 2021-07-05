import React, { FC, useMemo, useState } from 'react';

import { styled } from '@linaria/react';
import BN from 'bn.js';

import { withdraw } from 'app/actions';
import { ParsedAccount, useMint } from 'app/contexts/accounts';
import { useConnection } from 'app/contexts/connection';
import { useWallet } from 'app/contexts/wallet';
import { Reserve } from 'app/models';
import { Button } from 'components/common/Button';
import { ButtonConnect } from 'components/common/ButtonConnect';
import { ButtonLoading } from 'components/common/ButtonLoading';
import { CollateralInput } from 'components/common/CollateralInput';
import { calculateCollateralBalance, useUserBalance, useUserObligations } from 'hooks';
import { useMaxWithdrawValueInLiquidity } from 'hooks/lending/useMaxWithdrawValueInLiquidity';
import { notify } from 'utils/notifications';
import { fromLamports, wadToLamports } from 'utils/utils';

import { Bottom, MaxButton } from '../common/styled';
import { StateType } from '../types';

const CollateralBalanceWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
`;

interface Props {
  reserve: ParsedAccount<Reserve>;
  setState: (state: StateType) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

// TODO: show what your need to repay obligation if not available any amount for withdraw
export const Withdraw: FC<Props> = ({ reserve, setState, isLoading, setIsLoading }) => {
  const connection = useConnection();
  const { wallet } = useWallet();

  const [value, setValue] = useState('');

  const { userObligations } = useUserObligations();
  const { accounts: sourceAccounts } = useUserBalance(reserve.info.collateral.mintPubkey);
  const liquidityMint = useMint(reserve.info.liquidity.mintPubkey);

  const obligation = userObligations[0]?.obligation || null;
  const depositReserve = obligation
    ? obligation.info.deposits.find((deposit) => deposit.depositReserve.equals(reserve.pubkey))
    : null;

  const collateralBalanceLamports = depositReserve
    ? calculateCollateralBalance(reserve.info, depositReserve.depositedAmount.toNumber())
    : 0;
  const collateralBalanceInLiquidity = depositReserve ? fromLamports(collateralBalanceLamports, liquidityMint) : 0;

  // Calculate the maximum value that can be withdrawn
  const maxWithdrawValueInLiquidity = useMaxWithdrawValueInLiquidity(reserve, obligation);

  const handleValueChange = (nextValue: string) => {
    if (!obligation) {
      return;
    }

    // if (nextValue && maxWithdrawValueInLiquidity.lten(parseFloat(nextValue))) {
    //   setValue(maxWithdrawValueInLiquidity.toString());
    // } else {
    setValue(nextValue);
    // }
  };

  const handleMaxClick = () => {
    setValue(maxWithdrawValueInLiquidity.toString());
  };

  const handleWithdrawClick = async () => {
    if (!wallet?.publicKey) {
      return;
    }

    if (!obligation) {
      return;
    }

    setIsLoading(true);

    try {
      const collateralAmount = Math.ceil(
        collateralBalanceLamports * (parseFloat(value) / collateralBalanceInLiquidity)
      );

      await withdraw(connection, wallet, sourceAccounts[0], collateralAmount, reserve, obligation);

      setValue('');
      setState('balance');
    } catch (error) {
      // TODO:
      console.log(error);
      notify({
        message: 'Unable to withdraw.',
        type: 'error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isWithdrawDisabled = sourceAccounts.length === 0 || !value;

  return (
    <>
      <CollateralBalanceWrapper>
        <CollateralInput
          mintAddress={reserve.info.liquidity.mintPubkey.toBase58()}
          value={value}
          onChange={handleValueChange}
        />
        <MaxButton onClick={handleMaxClick}>Max</MaxButton>
      </CollateralBalanceWrapper>
      <Bottom>
        {isLoading ? (
          <ButtonLoading />
        ) : (
          <ButtonConnect>
            <Button disabled={isWithdrawDisabled} onClick={handleWithdrawClick} className="full">
              Withdraw
            </Button>
            <Button onClick={() => setState('balance')}>Cancel</Button>
          </ButtonConnect>
        )}
      </Bottom>
    </>
  );
};
