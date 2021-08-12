import React, { FC, useCallback, useState } from 'react';

import { styled } from '@linaria/react';
import { useWallet } from '@solana/wallet-adapter-react';

import { repay } from 'app/actions';
import { ParsedAccount, useMint } from 'app/contexts/accounts';
import { useConnection } from 'app/contexts/connection';
import { Reserve } from 'app/models';
import { Button } from 'components/common/Button';
import { ButtonConnect } from 'components/common/ButtonConnect';
import { ButtonLoading } from 'components/common/ButtonLoading';
import { CollateralInput } from 'components/common/CollateralInput';
import { calculateCollateralBalance, useSliderInput, useUserBalance, useUserObligations } from 'hooks';
import { notify } from 'utils/notifications';
import { fromLamports, wadToLamports } from 'utils/utils';

import { Bottom } from '../common/styled';
import { StateType } from '../types';
import { Range } from './Range';

const CollateralBalanceWrapper = styled.div`
  display: grid;
  flex: 1;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  align-items: center;
  justify-content: space-between;

  column-gap: 10px;
`;

interface Props {
  reserve: ParsedAccount<Reserve>;
  setState: (state: StateType) => void;
}

// TODO: show something if user don't have liqudity to repay
export const Repay: FC<Props> = ({ reserve, setState }) => {
  const connection = useConnection();
  const wallet = useWallet();

  const [isLoading, setIsLoading] = useState(false);

  const { userObligations } = useUserObligations();
  const liquidityMint = useMint(reserve.info.liquidity.mintPubkey);

  const obligation = userObligations[0]?.obligation || null;
  const borrowReserve = obligation
    ? obligation.info.borrows.find((borrow) => borrow.borrowReserve.equals(reserve.pubkey))
    : null;

  const collateralBalanceLamports = borrowReserve
    ? calculateCollateralBalance(reserve.info, wadToLamports(borrowReserve.borrowedAmountWads).toNumber())
    : 0;
  const collateralBalanceInLiquidity = borrowReserve ? fromLamports(collateralBalanceLamports, liquidityMint) : 0;

  const { accounts: sourceAccounts, balance, balanceLamports } = useUserBalance(reserve.info.liquidity.mintPubkey);

  const convert = useCallback(
    (val: string | number) => {
      if (typeof val === 'string') {
        return (parseFloat(val) / collateralBalanceInLiquidity) * 100;
      } else {
        return (val * collateralBalanceInLiquidity) / 100;
      }
    },
    [collateralBalanceInLiquidity]
  );

  const { value, setValue, pct, setPct } = useSliderInput(convert);

  const handleValueChange = (nextValue: string) => {
    setValue(nextValue);
  };

  const handleRepayClick = async () => {
    if (!wallet?.publicKey) {
      return;
    }

    setIsLoading(true);

    try {
      const sourceTokenAccount = sourceAccounts[0];
      const liquidityAmount = Math.ceil(balanceLamports * (parseFloat(value) / balance));

      await repay(connection, wallet, liquidityAmount, sourceTokenAccount, reserve, obligation);

      setValue('');
      setState('balance');
    } catch (error) {
      // TODO:
      console.log(error);
      notify({
        message: 'Error in repay.',
        type: 'error',
        description: error.message,
      });

      setIsLoading(false);
    }
  };

  return (
    <>
      <CollateralBalanceWrapper>
        <CollateralInput
          mintAddress={reserve.info.liquidity.mintPubkey.toBase58()}
          value={value}
          onChange={handleValueChange}
        />
        <Range value={pct} onChange={(val) => setPct(val)} />
      </CollateralBalanceWrapper>
      <Bottom>
        {isLoading ? (
          <ButtonLoading />
        ) : (
          <ButtonConnect>
            <Button onClick={handleRepayClick} className="full">
              Repay
            </Button>
            <Button onClick={() => setState('balance')}>Cancel</Button>
          </ButtonConnect>
        )}
      </Bottom>
    </>
  );
};
