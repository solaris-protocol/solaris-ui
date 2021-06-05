import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';
import { PublicKey } from '@solana/web3.js';

import { withdraw } from 'app/actions';
import { useConnection } from 'app/contexts/connection';
import { useWallet } from 'app/contexts/wallet';
import { Reserve } from 'app/models';
import { Button } from 'components/common/Button';
import { ButtonConnect } from 'components/common/ButtonConnect';
import { ButtonLoading } from 'components/common/ButtonLoading';
import { CollateralInput } from 'components/common/CollateralInput';
import { useUserBalance, useUserCollateralBalance } from 'hooks';
import { notify } from 'utils/notifications';

import { Bottom, MaxButton } from '../common/styled';
import { StateType } from '../types';

const CollateralBalanceWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
`;

interface Props {
  reserve: Reserve;
  address: PublicKey;
  setState: (state: StateType) => void;
}

export const Withdraw: FC<Props> = ({ reserve, address, setState }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState('');

  const connection = useConnection();
  const { wallet } = useWallet();
  const { accounts: fromAccounts, balanceLamports: collateralBalanceLamports } = useUserBalance(
    reserve?.collateral.mintPubkey
  );
  const { balance: collateralBalanceInLiquidity } = useUserCollateralBalance(reserve);

  const handleValueChange = (nextValue: string) => {
    setValue(nextValue);
  };

  const handleMaxClick = () => {
    setValue(collateralBalanceInLiquidity.toString());
  };

  const handleWithdrawClick = async () => {
    if (!wallet?.publicKey) {
      return;
    }

    setIsLoading(true);

    try {
      await withdraw(
        fromAccounts[0],
        Math.ceil(collateralBalanceLamports * (parseFloat(value) / collateralBalanceInLiquidity)),
        reserve,
        address,
        connection,
        wallet
      );

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

  return (
    <>
      <CollateralBalanceWrapper>
        <CollateralInput mintAddress={reserve.liquidity.mintPubkey} value={value} onChange={handleValueChange} />
        <MaxButton onClick={handleMaxClick}>Max</MaxButton>
      </CollateralBalanceWrapper>
      <Bottom>
        {isLoading ? (
          <ButtonLoading />
        ) : (
          <ButtonConnect>
            <Button disabled={fromAccounts.length === 0} onClick={handleWithdrawClick} className="full">
              Withdraw
            </Button>
            <Button onClick={() => setState('balance')}>Cancel</Button>
          </ButtonConnect>
        )}
      </Bottom>
    </>
  );
};
