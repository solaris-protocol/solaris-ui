import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';
import { useWallet } from '@solana/wallet-adapter-react';

import { deposit } from 'app/actions';
import { ParsedAccount } from 'app/contexts/accounts';
import { useConnection } from 'app/contexts/connection';
import { Reserve } from 'app/models';
import { Button } from 'components/common/Button';
import { ButtonConnect } from 'components/common/ButtonConnect';
import { ButtonLoading } from 'components/common/ButtonLoading';
import { CollateralInput } from 'components/common/CollateralInput';
import { useUserBalance, useUserObligations } from 'hooks';
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
  reserve: ParsedAccount<Reserve>;
  setState: (state: StateType) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const Deposit: FC<Props> = ({ reserve, setState, isLoading, setIsLoading }) => {
  const connection = useConnection();
  const wallet = useWallet();

  const [value, setValue] = useState('');

  const { userObligations } = useUserObligations();
  const obligation = userObligations[0]?.obligation || null;

  const { accounts: sourceAccounts, balance, balanceLamports } = useUserBalance(reserve.info.liquidity.mintPubkey);

  const handleValueChange = (nextValue: string) => {
    setValue(nextValue);
  };

  const handleMaxClick = () => {
    setValue(balance.toString());
  };

  const handleDepositClick = async () => {
    if (!wallet?.publicKey) {
      return;
    }

    setIsLoading(true);

    try {
      const sourceTokenAccount = sourceAccounts[0];
      const liquidityAmount = Math.ceil(balanceLamports * (parseFloat(value) / balance));

      await deposit(connection, wallet, sourceTokenAccount, liquidityAmount, reserve, obligation);

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
    } finally {
      setIsLoading(false);
    }
  };

  const isDepositDisabled = sourceAccounts.length === 0 || !value;

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
            <Button disabled={isDepositDisabled} onClick={handleDepositClick} className="full">
              Deposit
            </Button>
            <Button onClick={() => setState('balance')}>Cancel</Button>
          </ButtonConnect>
        )}
      </Bottom>
    </>
  );
};

Deposit.whyDidYouRender = true;
