import './style.less';

import React, { useCallback, useState } from 'react';

import { PublicKey } from '@solana/web3.js';
import { Card, Slider } from 'antd';

import { deposit } from '../../../app/actions/deposit';
import { useConnection } from '../../../app/contexts/connection';
import { useWallet } from '../../../app/contexts/wallet';
import { Reserve } from '../../../app/models/lending';
import { LABELS, marks } from '../../../constants';
import { InputType, useSliderInput, useUserBalance } from '../../../hooks';
import { notify } from '../../../utils/notifications';
import { ActionConfirmation } from '../ActionConfirmation';
import CollateralInput from '../CollateralInput';
import { ConnectButton } from '../ConnectButton';

export const DepositInput = (props: { className?: string; reserve: Reserve; address: PublicKey }) => {
  const connection = useConnection();
  const { wallet } = useWallet();
  const [pendingTx, setPendingTx] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const reserve = props.reserve;
  const address = props.address;

  const { accounts: fromAccounts, balance, balanceLamports } = useUserBalance(reserve?.liquidity.mintPubkey);

  const convert = useCallback(
    (val: string | number) => {
      if (typeof val === 'string') {
        return (parseFloat(val) / balance) * 100;
      } else {
        return (val * balance) / 100;
      }
    },
    [balance]
  );

  const { value, setValue, pct, setPct, type } = useSliderInput(convert);

  const onDeposit = useCallback(() => {
    if (!wallet?.publicKey) {
      return;
    }

    setPendingTx(true);

    (async () => {
      try {
        await deposit(
          fromAccounts[0],
          type === InputType.Percent
            ? (pct * balanceLamports) / 100
            : Math.ceil(balanceLamports * (parseFloat(value) / balance)),
          reserve,
          address,
          connection,
          wallet
        );

        setValue('');
        setShowConfirmation(true);
      } catch (error) {
        // TODO:
        console.log(error);
        notify({
          message: 'Error in deposit.',
          type: 'error',
          description: error.message,
        });
      } finally {
        setPendingTx(false);
      }
    })();
  }, [connection, setValue, balanceLamports, balance, wallet, value, pct, type, reserve, fromAccounts, address]);

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
          <div className="deposit-input-title">{LABELS.DEPOSIT_QUESTION}</div>
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
            onClick={onDeposit}
            loading={pendingTx}
            disabled={fromAccounts.length === 0}
          >
            {LABELS.DEPOSIT_ACTION}
          </ConnectButton>
        </div>
      )}
    </Card>
  );
};
