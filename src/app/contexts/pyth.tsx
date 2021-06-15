import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { parseMappingData, parsePriceData, parseProductData } from '@pythnetwork/client';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import throttle from 'lodash/throttle';

import { getMultipleAccounts, ParsedAccountBase } from 'app/contexts/accounts';
import { useConnectionConfig } from 'app/contexts/connection';
import { EventEmitter, PriceUpdateEvent } from 'utils/eventEmitter';

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

const priceEmitter = new EventEmitter();

export interface PythContextState {
  midPriceInUSD: (priceAddress: string) => number;
  priceEmitter: EventEmitter;
}

const PythContext = React.createContext<PythContextState | null>(null);

const createSetPriceAccountMapUpdater =
  (priceAddress: string, symbol: string, product: any, price: any) => (prev: any) => {
    if (!prev[priceAddress] || prev[priceAddress].price['currentSlot'] < price.currentSlot) {
      return {
        ...prev,
        [priceAddress]: {
          symbol,
          product,
          price,
        },
      };
    }

    return prev;
  };

type PythType = {
  symbol: string;
  product: any;
  price: ReturnType<typeof parsePriceData>;
};

interface ISymbolMap {
  [index: string]: PythType;
}

export function PythProvider({ children = null as any }) {
  const { endpoint } = useConnectionConfig();
  const connection = useMemo(() => new Connection(endpoint, 'recent'), [endpoint]);
  const pythByPriceAddressMap = useRef<ISymbolMap>({});

  const handlePriceInfo = (
    priceAddress: string,
    symbol: string,
    product: any,
    accountInfo: AccountInfo<Buffer> | null
  ) => {
    if (!accountInfo || !accountInfo.data) {
      return;
    }
    const price = parsePriceData(accountInfo.data);
    if (price.priceType !== 1) {
      console.log(symbol, price.priceType, price.nextPriceAccountKey?.toString());
    }

    // console.log(price);

    // console.log(`Product ${symbol} key: ${priceAddress} product: `, product, 'price:', price);

    pythByPriceAddressMap.current = createSetPriceAccountMapUpdater(
      priceAddress,
      symbol,
      product,
      price
    )(pythByPriceAddressMap.current);
    // setPriceAccountMap(createSetPriceAccountMapUpdater(priceAddress, symbol, product, price));
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

        // console.log(`Product ${symbol} key: ${key} price: ${priceMultiple.keys[i]} ${price.price}`);

        // handlePriceInfo(priceAccountKey.toBase58(), symbol, product, accountInfo);

        const subscriptionId = connection.onAccountChange(
          priceAccountKey,
          throttle((accountInfo) => {
            handlePriceInfo(priceAccountKey.toBase58(), symbol, product, accountInfo);
            priceEmitter.raisePriceUpdated(priceAccountKey.toBase58());
          }, 5000)
        );
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

  const midPriceInUSD = useCallback(
    (priceAddress: string) => {
      const price = pythByPriceAddressMap.current[priceAddress];

      if (!price) {
        return 0.0;
      }

      return price.price.price;
    },
    [pythByPriceAddressMap.current]
  );

  return (
    <PythContext.Provider
      value={{
        midPriceInUSD,
        priceEmitter,
      }}
    >
      {children}
    </PythContext.Provider>
  );
}

export const usePyth = () => {
  const context = useContext(PythContext);
  return context as PythContextState;
};

export const useMidPriceInUSD = (priceAddress: PublicKey | string) => {
  const address = typeof priceAddress === 'string' ? priceAddress : priceAddress.toBase58();
  const { midPriceInUSD, priceEmitter } = useContext(PythContext) as PythContextState;
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    const update = (args?: PriceUpdateEvent) => {
      if (args && args.id !== address) {
        return;
      }

      if (midPriceInUSD) {
        setPrice(midPriceInUSD(address));
      }
    };
    update();

    const dispose = priceEmitter.onPrice(update);
    return () => {
      dispose();
    };
  }, [midPriceInUSD, address, priceEmitter]);

  return { price, isBase: price === 1.0 };
};
