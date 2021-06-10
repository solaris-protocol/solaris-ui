import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { parseMappingData, parsePriceData, parseProductData } from '@pythnetwork/client';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';

import { cache, getMultipleAccounts, ParsedAccountBase } from 'app/contexts/accounts';
import { useConnectionConfig } from 'app/contexts/connection';

export const PriceParser = (pubKey: PublicKey, info: AccountInfo<Buffer>) => {
  const buffer = Buffer.from(info.data);

  const data = parsePriceData(buffer);

  return {
    pubkey: pubKey,
    account: {
      ...info,
    },
    info: data,
  } as ParsedAccountBase;
};

const DEFAULT_PYTH_MAPPING_ID = new PublicKey('ArppEFcsybCLE8CRtQJLQ9tLv2peGmQoKWFuiUWm4KBP');

export interface NewMarketsContextState {
  midPriceInUSD: (oracleAddress: string) => number;
}

const NewMarketsContext = React.createContext<NewMarketsContextState | null>(null);

const createSetSymbolMapUpdater = (symbol: string, product: any, price: any) => (prev: any) =>
  !prev[symbol] || prev[symbol].price['currentSlot'] < price.currentSlot
    ? {
        ...prev,
        [symbol]: {
          product,
          price,
        },
      }
    : prev;

interface ISymbolMap {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [index: string]: object;
}

export function NewMarketProvider({ children = null as any }) {
  const { endpoint } = useConnectionConfig();
  const connection = useMemo(() => new Connection(endpoint, 'recent'), [endpoint]);
  const [symbolMap, setSymbolMap] = useState<ISymbolMap>({});

  const handlePriceInfo = (
    symbol: string,
    product: any,
    accountInfo: AccountInfo<Buffer> | null
    // setSymbolMap: Function
  ) => {
    if (!accountInfo || !accountInfo.data) {
      return;
    }
    const price = parsePriceData(accountInfo.data);
    if (price.priceType !== 1) {
      console.log(symbol, price.priceType, price.nextPriceAccountKey?.toString());
    }

    console.log(price);

    // console.log(`Product ${symbol} key: ${key} price: ${accountInfo.data.} ${price.price}`);

    setSymbolMap(createSetSymbolMapUpdater(symbol, product, price));
  };

  useEffect(() => {
    const subscriptionIds: number[] = [];

    (async () => {
      const accountInfo = await connection.getAccountInfo(DEFAULT_PYTH_MAPPING_ID);
      if (!accountInfo || !accountInfo.data) {
        return;
      }

      const { productAccountKeys } = parseMappingData(accountInfo.data);

      const productsMultiple = await getMultipleAccounts(
        connection,
        productAccountKeys.map((productAccountInfo) => productAccountInfo.toBase58()),
        'confirmed'
      );
      const productsData = productsMultiple.array.map((productAccountInfo) =>
        parseProductData(productAccountInfo.data)
      );
      // const priceMultiple = await getMultipleAccounts(
      //   connection,
      //   productsData.map((data) => data.priceAccountKey.toBase58()),
      //   'confirmed'
      // );

      for (let i = 0; i < productsMultiple.keys.length; i++) {
        // const key = productsMultiple.keys[i];

        const productData = productsData[i];
        const product = productData.product;
        const symbol = product['symbol'];
        const priceAccountKey = productData.priceAccountKey;
        // const priceInfo = priceMultiple.array[i];
        // const price = parsePriceData(priceInfo.data);

        console.log(111, product);

        // console.log(`Product ${symbol} key: ${key} price: ${priceMultiple.keys[i]} ${price.price}`);

        const subscriptionId = connection.onAccountChange(priceAccountKey, (accountInfo) => {
          handlePriceInfo(symbol, product, accountInfo);
        });
        subscriptionIds.push(subscriptionId);
      }
    })();

    return () => {
      for (const subscriptionId of subscriptionIds) {
        connection.removeAccountChangeListener(subscriptionId).catch(() => {
          console.warn(`Unsuccessfully attempted to remove listener for subscription id ${subscriptionId}`);
        });
      }
    };
  }, [connection]);

  const midPriceInUSD = useCallback((oracleAddress: string) => {
    const price = cache.get(oracleAddress);
    if (!price) {
      return;
    }

    return price.info.price;
  }, []);

  return (
    <NewMarketsContext.Provider
      value={{
        midPriceInUSD,
      }}
    >
      {children}
    </NewMarketsContext.Provider>
  );
}

export const useNewMarkets = () => {
  const context = useContext(NewMarketsContext);
  return context as NewMarketsContextState;
};
