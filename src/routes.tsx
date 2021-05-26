import React, { FC } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';

import { Layout } from './components/common/Layout';
import {
  BorrowReserveView,
  BorrowView,
  DashboardView,
  DepositReserveView,
  DepositView,
  FaucetView,
  HomeView,
  LiquidateReserveView,
  LiquidateView,
  MarginTrading,
  RepayReserveView,
  ReserveView,
  TransactionListView,
  WithdrawView,
} from './old/views';
import { NewPosition } from './old/views/margin/newPosition';
import { Providers } from './Providers';

export const Routes: FC = () => {
  return (
    <>
      <HashRouter basename={'/'}>
        <Providers>
          <Layout>
            <Switch>
              <Route exact path="/" component={() => <HomeView />} />
              <Route exact path="/dashboard">
                <DashboardView />
              </Route>
              <Route exact path="/transactions">
                <TransactionListView />
              </Route>
              <Route path="/reserve/:id">
                <ReserveView />
              </Route>
              <Route exact path="/deposit">
                <DepositView />
              </Route>
              <Route path="/deposit/:id">
                <DepositReserveView />
              </Route>
              <Route path="/withdraw/:id">
                <WithdrawView />
              </Route>
              <Route exact path="/borrow">
                <BorrowView />
              </Route>
              <Route path="/borrow/:id">
                <BorrowReserveView />
              </Route>
              <Route path="/repay/loan/:obligation">
                <RepayReserveView />
              </Route>
              <Route path="/repay/:reserve">
                <RepayReserveView />
              </Route>
              <Route exact path="/liquidate">
                <LiquidateView />
              </Route>
              <Route path="/liquidate/:id">
                <LiquidateReserveView />
              </Route>
              <Route exact path="/margin">
                <MarginTrading />
              </Route>
              <Route path="/margin/:id">
                <NewPosition />
              </Route>
              <Route exact path="/faucet">
                <FaucetView />
              </Route>
            </Switch>
          </Layout>
        </Providers>
      </HashRouter>
    </>
  );
};
