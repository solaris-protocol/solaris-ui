import React, { FC } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';

import { Layout } from 'components/common/Layout';
import { Borrow } from 'pages/borrow';
import { Deposit } from 'pages/deposit';
import { Stake } from 'pages/stake';

import { Providers } from './Providers';

export const Routes: FC = () => {
  return (
    <>
      <HashRouter basename={'/'}>
        <Providers>
          <Layout>
            <Switch>
              <Route exact path={['/', '/deposit']}>
                <Deposit />
              </Route>
              <Route exact path="/borrow">
                <Borrow />
              </Route>
              <Route exact path="/stake">
                <Stake />
              </Route>
            </Switch>
          </Layout>
        </Providers>
      </HashRouter>
    </>
  );
};
