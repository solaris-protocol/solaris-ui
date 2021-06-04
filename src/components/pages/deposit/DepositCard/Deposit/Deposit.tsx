import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';
import { PublicKey } from '@solana/web3.js';

import { deposit } from 'app/actions';
import { useConnection } from 'app/contexts/connection';
import { useWallet } from 'app/contexts/wallet';
import { LendingReserve } from 'app/models';
import { Button } from 'components/common/Button';
import { ButtonConnect } from 'components/common/ButtonConnect';
import { CollateralInput } from 'components/common/CollateralInput';
import { ButtonLoading } from 'components/pages/deposit/DepositCard/common/ButtonLoading';
import { StateType } from 'components/pages/deposit/DepositCard/types';
import { InputType, useUserBalance } from 'hooks';
import { notify } from 'utils/notifications';

import { Bottom } from '../common/styled';

const CollateralBalanceWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
`;

const MaxButton = styled.button`
  height: 26px;
  padding: 0 10px;

  color: #fff;
  font-weight: bold;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: 0.15em;
  text-transform: uppercase;

  background-color: transparent;
  border: 1px solid #fff;
  border-radius: 5px;
  opacity: 0.5;

  transition: opacity 200ms ease-in-out;

  &:hover {
    opacity: 1;
  }
`;

interface Props {
  reserve: LendingReserve;
  address: PublicKey;
  setState: (state: StateType) => void;
}

export const Deposit: FC<Props> = ({ reserve, address, setState }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState('');

  const connection = useConnection();
  const { wallet } = useWallet();
  const { accounts: fromAccounts, balance, balanceLamports } = useUserBalance(reserve?.liquidityMint);

  const handleValueChange = (nextValue: string) => {
    setValue(nextValue);
  };

  const handleMaxClick = () => {
    setValue(balance.toString());
  };

  const handleDepositClick = async () => {
    // TODO: deposit

    if (!wallet?.publicKey) {
      return;
    }

    setIsLoading(true);

    try {
      console.log(111, Math.ceil(balanceLamports * (parseFloat(value) / balance)));

      await deposit(
        fromAccounts[0],
        Math.ceil(balanceLamports * (parseFloat(value) / balance)),
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
        message: 'Error in deposit.',
        type: 'error',
        description: error.message,
      });

      setIsLoading(false);
    }
  };

  return (
    <>
      <CollateralBalanceWrapper>
        <CollateralInput mintAddress={reserve.liquidityMint} value={value} onChange={handleValueChange} />
        <MaxButton onClick={handleMaxClick}>Max</MaxButton>
      </CollateralBalanceWrapper>
      <Bottom>
        {isLoading ? (
          <ButtonLoading />
        ) : (
          <ButtonConnect>
            <Button disabled={fromAccounts.length === 0} onClick={handleDepositClick} className="full">
              Deposit
            </Button>
            <Button onClick={() => setState('balance')}>Cancel</Button>
          </ButtonConnect>
        )}
      </Bottom>
    </>
  );
};
