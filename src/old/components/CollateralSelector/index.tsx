import React from 'react';

import { Select } from 'antd';

import { cache, ParsedAccount } from '../../../app/contexts/accounts';
import { useConnectionConfig } from '../../../app/contexts/connection';
import { LendingMarket, Reserve } from '../../../app/models';
import { TokenIcon } from '../../../components/common/TokenIcon';
import { useLendingReserves, UserDeposit, useUserDeposits } from '../../../hooks';
import { formatAmount, getTokenName } from '../../../utils/utils';

const { Option } = Select;

export const CollateralItem = (props: {
  mint: string;
  reserve: ParsedAccount<Reserve>;
  userDeposit?: UserDeposit;
  name: string;
}) => {
  const { mint, name, userDeposit } = props;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <TokenIcon mintAddress={mint} />
        {name}
        <span className="token-balance">&nbsp; {userDeposit ? formatAmount(userDeposit.info.amount) : '--'}</span>
      </div>
    </>
  );
};

export const CollateralSelector = (props: {
  reserve: Reserve;
  collateralReserve?: string;
  disabled?: boolean;
  onCollateralReserve?: (id: string) => void;
}) => {
  const { reserveAccounts } = useLendingReserves();
  const { tokenMap } = useConnectionConfig();
  const { userDeposits } = useUserDeposits();

  const market = cache.get(props.reserve?.lendingMarket) as ParsedAccount<LendingMarket>;
  if (!market) return null;

  const quoteMintAddress = market?.info?.quoteTokenMint?.toBase58();

  const onlyQuoteAllowed = props.reserve?.liquidity.mintPubkey?.toBase58() !== quoteMintAddress;

  return (
    <Select
      size="large"
      showSearch
      style={{ minWidth: 300, margin: '5px 0px' }}
      placeholder="Collateral"
      value={props.collateralReserve}
      disabled={props.disabled}
      defaultValue={props.collateralReserve}
      onChange={(item) => {
        if (props.onCollateralReserve) {
          props.onCollateralReserve(item);
        }
      }}
      filterOption={(input, option) => option?.name?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
    >
      {reserveAccounts
        .filter((reserve) => reserve.info !== props.reserve)
        .filter((reserve) => !onlyQuoteAllowed || reserve.info.liquidity.mintPubkey.equals(market.info.quoteTokenMint))
        .map((reserve) => {
          const mint = reserve.info.liquidity.mintPubkey.toBase58();
          const address = reserve.pubkey.toBase58();
          const name = getTokenName(tokenMap, mint);

          return (
            <Option key={address} value={address} name={name} title={address}>
              <CollateralItem
                reserve={reserve}
                userDeposit={userDeposits.find((dep) => dep.reserve.pubkey.toBase58() === address)}
                mint={mint}
                name={name}
              />
            </Option>
          );
        })}
    </Select>
  );
};
