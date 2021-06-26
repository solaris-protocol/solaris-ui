import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';
import { PublicKey } from '@solana/web3.js';

import { deposit } from 'app/actions';
import { useConnection } from 'app/contexts/connection';
import { useWallet } from 'app/contexts/wallet';
import { Reserve } from 'app/models';
import { Button } from 'components/common/Button';
import { ButtonConnect } from 'components/common/ButtonConnect';
import { ButtonLoading } from 'components/common/ButtonLoading';
import { CollateralInput } from 'components/common/CollateralInput';
import { useUserBalance, useUserObligationByReserve } from 'hooks';
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

export const Deposit: FC<Props> = ({ reserve, address, setState }) => {
  const { userObligationsByReserve } = useUserObligationByReserve(undefined, address);

  console.log(666, reserve.liquidity.oraclePubkey.toBase58());

  console.log(
    111,
    userObligationsByReserve.map((o) => {
      return o.info.deposits.map((d) => [
        d.depositReserve.toBase58(),
        d.depositedAmount.toString(),
        d.marketValue.toString(),
      ]);
    })
  );
  console.log(
    222,
    userObligationsByReserve.map((o) => {
      return o.info.depositedValue.toString();
    })
  );
  console.log(333, userObligationsByReserve[0]);

  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState('');

  const connection = useConnection();
  const { wallet } = useWallet();
  const { accounts: fromAccounts, balance, balanceLamports } = useUserBalance(reserve?.liquidity.mintPubkey);

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
      await deposit(
        connection,
        wallet,
        fromAccounts[0],
        Math.ceil(balanceLamports * (parseFloat(value) / balance)),
        reserve,
        address,
        userObligationsByReserve[0]
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
        <CollateralInput
          mintAddress={reserve.liquidity.mintPubkey.toBase58()}
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

Deposit.whyDidYouRender = true;
