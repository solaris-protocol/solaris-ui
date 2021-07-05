import React, { FC, useCallback, useMemo, useState } from 'react';

import { styled } from '@linaria/react';

import { borrow } from 'app/actions';
import { ParsedAccount } from 'app/contexts/accounts';
import { useConnection } from 'app/contexts/connection';
import { useWallet } from 'app/contexts/wallet';
import { Reserve } from 'app/models';
import { Button } from 'components/common/Button';
import { ButtonConnect } from 'components/common/ButtonConnect';
import { ButtonLoading } from 'components/common/ButtonLoading';
import { CollateralInput } from 'components/common/CollateralInput';
import { useSliderInput, useUserObligations } from 'hooks';
import { notify } from 'utils/notifications';
import { wadToLamports } from 'utils/utils';

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

export const Borrow: FC<Props> = ({ reserve: borrowReserve, setState }) => {
  const connection = useConnection();
  const { wallet } = useWallet();

  const [isLoading, setIsLoading] = useState(false);

  const { userObligations } = useUserObligations();
  const obligation = userObligations[0]?.obligation || null;

  // Calculate the maximum liquidity value that can be borrowed
  const maxBorrowValueInLiquidity = useMemo(() => {
    if (!obligation) {
      return 0;
    }

    // remaining_borrow_value
    // https://github.com/solana-labs/solana-program-library/blob/0b3552b8926a9e4b37074a3d19d06591d47ed50a/token-lending/program/src/state/obligation.rs#L106
    const remainingBorrowValue = obligation?.info.allowedBorrowValue.sub(obligation?.info.borrowedValue);

    return wadToLamports(remainingBorrowValue).toNumber() / borrowReserve.info.liquidity.marketPrice.toNumber();
  }, [obligation]);

  const convert = useCallback(
    (val: string | number) => {
      const minAmount = Math.min(maxBorrowValueInLiquidity, Infinity);
      if (typeof val === 'string') {
        return (parseFloat(val) / minAmount) * 100;
      } else {
        return (val * minAmount) / 100;
      }
    },
    [maxBorrowValueInLiquidity]
  );

  const { value, setValue, pct, setPct } = useSliderInput(convert);

  const handleValueChange = (nextValue: string) => {
    setValue(nextValue);
  };

  const handleBorrowClick = async () => {
    if (!wallet?.publicKey) {
      return;
    }

    setIsLoading(true);

    try {
      await borrow(connection, wallet, parseFloat(value), borrowReserve, obligation);

      setValue('');
      setState('balance');
    } catch (error) {
      // TODO:
      console.log(error);
      notify({
        message: 'Error in borrow.',
        type: 'error',
        description: error.message,
      });

      setIsLoading(false);
    }
  };

  const isBorrowDisabled = !value && !obligation;

  return (
    <>
      <CollateralBalanceWrapper>
        <CollateralInput
          mintAddress={borrowReserve.info.liquidity.mintPubkey.toBase58()}
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
            <Button disabled={isBorrowDisabled} onClick={handleBorrowClick} className="full">
              Borrow
            </Button>
            <Button onClick={() => setState('balance')}>Cancel</Button>
          </ButtonConnect>
        )}
      </Bottom>
    </>
  );
};
