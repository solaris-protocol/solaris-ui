import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';
import { PublicKey } from '@solana/web3.js';

import { StakeTokenForm } from 'components/modals/stakeModals/common/StakeTokenForm';
import { YouReceive } from 'components/modals/stakeModals/ModalStake/YouReceive';
import { CommonModalPropsType } from 'components/modals/types';

import { StakeModal } from '../../common/StakeModal';
import { Button } from '../common/styled';
import { YouStake } from './YouStake';

const Delimiter = styled.div`
  width: 100%;
  height: 1px;
  margin: 20px 0 25px;

  background: rgba(255, 255, 255, 0.1); ;
`;

const ButtonStyled = styled(Button)`
  margin-top: 36px;
`;

export const ModalStake: FC<CommonModalPropsType> = ({ close, ...props }) => {
  const fromMint = new PublicKey('So11111111111111111111111111111111111111112');
  const toMint = new PublicKey('So11111111111111111111111111111111111111113');
  const [fromAmount, setFromAmount] = useState(1.0);
  const [toAmount, setToAmount] = useState(1.0);

  return (
    <StakeModal title="Select wallet" close={close} {...props}>
      <YouStake mintPubkey={fromMint} />
      <StakeTokenForm mint={fromMint} amount={fromAmount} setAmount={setFromAmount} />
      <Delimiter />
      <YouReceive />
      <StakeTokenForm mint={toMint} amount={toAmount} setAmount={setToAmount} />
      <ButtonStyled onClick={() => setFromAmount(0)}>Stake</ButtonStyled>
    </StakeModal>
  );
};
