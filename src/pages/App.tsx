import "../styles/global.scss"

import {
  BLOCK_TIME,
  BTC_POOL_NAME,
  STABLECOIN_POOL_NAME,
  VETH2_POOL_NAME,
} from "../constants"
import React, { ReactElement, Suspense, useCallback } from "react"
import { Route, Switch } from "react-router-dom"

import { AppDispatch } from "../state"
import Deposit from "./Deposit"
import Pools from "./Pools"
import Risk from "./Risk"
import Swap from "./Swap"
import ToastsProvider from "../providers/ToastsProvider"
import Web3ReactManager from "../components/Web3ReactManager"
import Withdraw from "./Withdraw"
import fetchGasPrices from "../utils/updateGasPrices"
import fetchTokenPricesUSD from "../utils/updateTokenPrices"
import { useActiveWeb3React } from "../hooks"
import { useDispatch } from "react-redux"
import usePoller from "../hooks/usePoller"

export default function App(): ReactElement {
  return (
    <Suspense fallback={null}>
      <Web3ReactManager>
        <GasAndTokenPrices>
          <ToastsProvider>
            <Switch>
              <Route exact path="/" component={Swap} />
              <Route exact path="/pools" component={Pools} />
              <Route
                exact
                path="/pools/usd/deposit"
                render={(props) => (
                  <Deposit {...props} poolName={STABLECOIN_POOL_NAME} />
                )}
              />
              <Route
                exact
                path="/pools/btc/deposit"
                render={(props) => (
                  <Deposit {...props} poolName={BTC_POOL_NAME} />
                )}
              />
              <Route
                exact
                path="/pools/veth2/deposit"
                render={(props) => (
                  <Deposit {...props} poolName={VETH2_POOL_NAME} />
                )}
              />
              <Route
                exact
                path="/pools/btc/withdraw"
                render={(props) => (
                  <Withdraw {...props} poolName={BTC_POOL_NAME} />
                )}
              />
              <Route
                exact
                path="/pools/usd/withdraw"
                render={(props) => (
                  <Withdraw {...props} poolName={STABLECOIN_POOL_NAME} />
                )}
              />
              <Route
                exact
                path="/pools/veth2/withdraw"
                render={(props) => (
                  <Withdraw {...props} poolName={VETH2_POOL_NAME} />
                )}
              />
              <Route exact path="/risk" component={Risk} />
            </Switch>
          </ToastsProvider>
        </GasAndTokenPrices>
      </Web3ReactManager>
    </Suspense>
  )
}

function GasAndTokenPrices({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const dispatch = useDispatch<AppDispatch>()
  const { library } = useActiveWeb3React()

  const fetchAndUpdateGasPrice = useCallback(() => {
    void fetchGasPrices(dispatch)
  }, [dispatch])
  const fetchAndUpdateTokensPrice = useCallback(() => {
    fetchTokenPricesUSD(dispatch, library)
  }, [dispatch, library])
  usePoller(fetchAndUpdateGasPrice, BLOCK_TIME)
  usePoller(fetchAndUpdateTokensPrice, BLOCK_TIME * 3)
  return <>{children}</>
}
