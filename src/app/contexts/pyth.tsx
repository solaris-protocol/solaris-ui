// https://github.com/solana-labs/oyster/blob/11d8ba6047d8b8218e905138b21f49de09be9657/packages/lending/src/contexts/pyth.tsx

import React, { useCallback, useContext, useEffect, useState } from 'react';

import { parseMappingData, parsePriceData, parseProductData } from '@pythnetwork/client';
import { PublicKey } from '@solana/web3.js';
import throttle from 'lodash/throttle';

import { useTokenListContext } from 'app/contexts/tokenList';
import { PYTH_PROGRAM_ID } from 'utils/ids';

import { getMultipleAccounts } from './accounts/accounts';
import { useConnection } from './connection';

type Products = Record<string, Product>;
type Prices = Record<string, number>;

type Subscription = { id: number; count: number } | undefined;
type Subscriptions = Record<string, Subscription>;

export interface PythContextState {
  products: Products;
  prices: Prices;
  getPrice: (mint: string) => number;
}

const PythContext = React.createContext<PythContextState>({
  products: {},
  prices: {},
  getPrice: (mint: string) => 0,
});

// TODO: reduce rerendering
// TODO: unsubscribe
export function PythProvider({ children = null as any }) {
  const connection = useConnection();
  const { tokenMap } = useTokenListContext();
  const [products, setProducts] = useState<Products>({});
  const [prices, setPrices] = useState<Prices>({});
  const [subscriptions, setSubscriptions] = useState<Subscriptions>({});

  useEffect(() => {
    (async () => {
      try {
        const accountInfo = await connection.getAccountInfo(PYTH_PROGRAM_ID);
        if (!accountInfo || !accountInfo.data) {
          return;
        }

        const { productAccountKeys } = parseMappingData(accountInfo.data);

        const productInfos = await getMultipleAccounts(
          connection,
          productAccountKeys.map((p) => p.toBase58()),
          'confirmed'
        );

        const products = productInfos.array.reduce((products, p) => {
          const product = parseProductData(p.data);
          const symbol = product.product['symbol'];
          products[symbol] = product;
          return products;
        }, {} as Products);
        setProducts(products);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [connection, setProducts]);

  const subscribeToPrice = useCallback(
    (mint: string) => {
      let subscription = subscriptions[mint];
      if (subscription) {
        return;
      }

      const symbol = tokenMap.get(mint)?.symbol;
      if (!symbol) {
        return;
      }

      const product = products[`${symbol}/USD`];
      if (!product) {
        return;
      }

      const id = connection.onAccountChange(
        product.priceAccountKey,
        throttle((accountInfo) => {
          try {
            const price = parsePriceData(accountInfo.data);

            // console.log('price: ', price);
            //
            // const exponent = Math.abs(price.exponent);
            // const decimals = new BN(10).pow(new BN(exponent.toString()));

            setPrices({ ...prices, [mint]: price.price });
          } catch (e) {
            console.error(e);
          }
        }, 2000)
      );

      // @TODO: add subscription counting / removal
      subscription = { id, count: 1 };
      setSubscriptions({ ...subscriptions, [mint]: subscription });
    },
    [subscriptions, tokenMap, products, connection, prices, setPrices, setSubscriptions]
  );

  const getPrice = useCallback(
    (mint: string) => {
      subscribeToPrice(mint);
      return prices[mint] || 0;
    },
    [subscribeToPrice, prices]
  );

  return (
    <PythContext.Provider
      value={{
        products,
        prices,
        getPrice,
      }}
    >
      {children}
    </PythContext.Provider>
  );
}

export const usePyth = () => {
  return useContext(PythContext);
};

export const usePrice = (mintAddress: string | PublicKey) => {
  const { getPrice } = useContext(PythContext);
  const [price, setPrice] = useState(0);

  const mint = typeof mintAddress === 'string' ? mintAddress : mintAddress.toBase58();

  useEffect(() => {
    setPrice(getPrice(mint));
  }, [setPrice, getPrice, mint]);

  return price;
};

interface Product {
  magic: number;
  version: number;
  type: number;
  size: number;
  priceAccountKey: PublicKey;
  product: ProductAttributes;
}

interface ProductAttributes {
  [index: string]: string;
}
