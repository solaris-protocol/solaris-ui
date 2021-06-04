import './style.less';

import React, { useCallback, useState } from 'react';

import { PublicKey } from '@solana/web3.js';
import { Card, Slider } from 'antd';

import { withdraw } from '../../../app/actions';
import { useConnection } from '../../../app/contexts/connection';
import { useWallet } from '../../../app/contexts/wallet';
import { Reserve } from '../../../app/models/lending';
import { LABELS, marks } from '../../../constants';
import { InputType, useSliderInput, useUserBalance, useUserCollateralBalance } from '../../../hooks';
import { notify } from '../../../utils/notifications';
import { ActionConfirmation } from '../ActionConfirmation';
import CollateralInput from '../CollateralInput';
import { ConnectButton } from '../ConnectButton';

export const WithdrawInput = (props: { className?: string; reserve: Reserve; address: PublicKey }) => {
  const connection = useConnection();
  const { wallet } = useWallet();
  const [pendingTx, setPendingTx] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const reserve = props.reserve;
  const address = props.address;

  const { balanceLamports: collateralBalanceLamports, accounts: fromAccounts } = useUserBalance(
    reserve?.collateral.mintPubkey
  );
  const { balance: collateralBalanceInLiquidity } = useUserCollateralBalance(reserve);

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

  const { value, setValue, pct, setPct, type } = useSliderInput(convert);

  const onWithdraw = useCallback(() => {
    if (!wallet?.publicKey) {
      return;
    }

    setPendingTx(true);

    (async () => {
      try {
        const withdrawAmount = Math.min(
          type === InputType.Percent
            ? (pct * collateralBalanceLamports) / 100
            : Math.ceil(collateralBalanceLamports * (parseFloat(value) / collateralBalanceInLiquidity)),
          collateralBalanceLamports
        );
        await withdraw(fromAccounts[0], withdrawAmount, reserve, address, connection, wallet);

        setValue('');
        setShowConfirmation(true);
      } catch (error) {
        // TODO:
        notify({
          message: 'Unable to withdraw.',
          type: 'error',
          description: error.message,
        });
      } finally {
        setPendingTx(false);
      }
    })();
  }, [
    address,
    collateralBalanceInLiquidity,
    collateralBalanceLamports,
    connection,
    fromAccounts,
    pct,
    reserve,
    setValue,
    type,
    value,
    wallet,
    wallet?.publicKey,
  ]);

  const bodyStyle: React.CSSProperties = {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  };

  return (
    <Card className={props.className} bodyStyle={bodyStyle}>
      {showConfirmation ? (
        <ActionConfirmation onClose={() => setShowConfirmation(false)} />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
          }}
        >
          <div className="withdraw-input-title">{LABELS.WITHDRAW_QUESTION}</div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignItems: 'center',
            }}
          >
            <CollateralInput
              title="Amount"
              reserve={reserve}
              amount={parseFloat(value) || 0}
              onInputChange={(val: number | null) => {
                setValue(val?.toString() || '');
              }}
              disabled={true}
              hideBalance={true}
            />
          </div>

          <Slider marks={marks} value={pct} onChange={setPct} />

          <ConnectButton
            size="large"
            type="primary"
            onClick={onWithdraw}
            loading={pendingTx}
            disabled={fromAccounts.length === 0}
          >
            {fromAccounts.length === 0 ? LABELS.NO_COLLATERAL : LABELS.WITHDRAW_ACTION}
          </ConnectButton>
        </div>
      )}
    </Card>
  );
};
