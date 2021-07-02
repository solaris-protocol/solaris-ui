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
import { calculateCollateralBalance, useUserBalance, useUserObligationByReserve } from 'hooks';
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
}

// TODO: show what your need to repay obligation if not available any amount for withdraw
export const Withdraw: FC<Props> = ({ reserve, setState }) => {
  const connection = useConnection();
  const { wallet } = useWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState('');

  const { userObligationsByReserve } = useUserObligationByReserve(undefined, reserve.pubkey);
  const { accounts: sourceAccounts } = useUserBalance(reserve.info.collateral.mintPubkey);
  const liquidityMint = useMint(reserve.info.liquidity.mintPubkey);

  const obligation = userObligationsByReserve[0]?.obligation || null;
  const depositReserve = obligation
    ? obligation.info.deposits.find((deposit) => deposit.depositReserve.equals(reserve.pubkey))
    : null;

  const collateralBalanceLamports = depositReserve
    ? calculateCollateralBalance(reserve.info, depositReserve.depositedAmount.toNumber())
    : 0;
  const collateralBalanceInLiquidity = depositReserve ? fromLamports(collateralBalanceLamports, liquidityMint) : 0;

  // Calculate the maximum value that can be withdrawn
  const maxWithdrawValueInLiquidity = useMemo(() => {
    if (!obligation) {
      return 0;
    }

    // max_withdraw_value
    // https://github.com/solana-labs/solana-program-library/blob/0b3552b8926a9e4b37074a3d19d06591d47ed50a/token-lending/program/src/state/obligation.rs#L94

    const depositedValue = obligation.info.depositedValue; /* obligation.info.deposits.reduce((prev, curr) => {
      return prev.add(curr.marketValue);
    }, new BN(0)); */

    const requiredDepositValue = obligation.info.borrowedValue
      .mul(depositedValue)
      .div(obligation.info.allowedBorrowValue);

    if (requiredDepositValue.gte(depositedValue)) {
      return new BN(0);
    }

    const maxWithdrawValue = depositedValue.sub(requiredDepositValue);
    return wadToLamports(maxWithdrawValue).toNumber() / reserve.info.liquidity.marketPrice.toNumber();
  }, [obligation, reserve]);

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
