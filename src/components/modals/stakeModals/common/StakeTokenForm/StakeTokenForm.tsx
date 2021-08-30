import React, { FC } from 'react';

import { styled } from '@linaria/react';
import { PublicKey } from '@solana/web3.js';

import { useMint } from 'app/contexts/accounts';
import { usePrice } from 'app/contexts/pyth';
import { Input } from 'components/common/Input';
import { TokenIcon } from 'components/common/TokenIcon';
import { useTokenName, useTokenSymbol } from 'hooks';
import { WRAPPED_SOL_MINT } from 'utils/ids';
import { formatNumber } from 'utils/utils';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  grid-gap: 8px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Left = styled.div`
  display: flex;
  flex-shrink: 0;
`;

const TokenIconStyled = styled(TokenIcon)`
  margin-right: 15px;
`;

const Symbol = styled.span`
  color: #fff;
  font-size: 30px;
  line-height: 37px;
  letter-spacing: 0.02em;
`;

const InputStyled = styled(Input)`
  margin-left: 20px;

  text-align: right;
`;

const Name = styled.div`
  color: #45364d;
  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: 0.02em;
`;

const BalanceUSD = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.02em;
`;

interface Props {
  mint: PublicKey;
  amount: number;
  setAmount: (a: number) => void;
}

export const StakeTokenForm: FC<Props> = ({ mint, amount, setAmount }) => {
  const symbol = useTokenSymbol(mint);
  let name = useTokenName(mint);
  const price = usePrice(mint);
  const valueIsUSD = price * amount;

  // emulate native SOL
  name = mint.equals(WRAPPED_SOL_MINT) ? 'Solana' : name;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  };

  return (
    <Wrapper>
      <Row>
        <Left>
          <TokenIconStyled mintAddress={mint} size={35} />
          <Symbol title={mint.toBase58()}>{symbol}</Symbol>
        </Left>
        <InputStyled placeholder="0.00" value={amount} onChange={handleChange} />
      </Row>
      <Row>
        <Name>{name}</Name>
        <BalanceUSD>${formatNumber.format(valueIsUSD)}</BalanceUSD>
      </Row>
    </Wrapper>
  );
};
