import "../styles/global.scss"
import "./NotifyStyle.scss"

import {
  ALETH_POOL_NAME,
  BLOCK_TIME,
  BTC_POOL_NAME,
  D4_POOL_NAME,
  STABLECOIN_POOL_NAME,
  VETH2_POOL_NAME,
} from "../constants"
import { AppDispatch, AppState } from "../state"
import React, { ReactElement, Suspense, useCallback } from "react"
import { Route, Switch } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"

import Deposit from "./Deposit"
import PendingSwapsProvider from "../providers/PendingSwapsProvider"
import Pools from "./Pools"
import Risk from "./Risk"
import Swap from "./Swap"
import Web3ReactManager from "../components/Web3ReactManager"
import Withdraw from "./Withdraw"
import fetchGasPrices from "../utils/updateGasPrices"
import fetchSwapStats from "../utils/getSwapStats"
import fetchTokenPricesUSD from "../utils/updateTokenPrices"
import { notify } from "../utils/notifyHandler"
import { useActiveWeb3React } from "../hooks"
import { useEffect } from "react"
import usePoller from "../hooks/usePoller"

export default function App(): ReactElement {
  const { chainId } = useActiveWeb3React()
  const { userDarkMode } = useSelector((state: AppState) => state.user)

  useEffect(() => {
    notify?.config({
      networkId: chainId ?? 1,
      darkMode: userDarkMode,
    })
  }, [chainId, userDarkMode])
  return (
    <Suspense fallback={null}>
      <Web3ReactManager>
        <GasAndTokenPrices>
          <PendingSwapsProvider>
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
                path="/pools/aleth/deposit"
                render={(props) => (
                  <Deposit {...props} poolName={ALETH_POOL_NAME} />
                )}
              />
              <Route
                exact
                path="/pools/d4/deposit"
                render={(props) => (
                  <Deposit {...props} poolName={D4_POOL_NAME} />
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
              <Route
                exact
                path="/pools/aleth/withdraw"
                render={(props) => (
                  <Withdraw {...props} poolName={ALETH_POOL_NAME} />
                )}
              />
              <Route
                exact
                path="/pools/d4/withdraw"
                render={(props) => (
                  <Withdraw {...props} poolName={D4_POOL_NAME} />
                )}
              />
              <Route exact path="/risk" component={Risk} />
            </Switch>
          </PendingSwapsProvider>
        </GasAndTokenPrices>
      </Web3ReactManager>
    </Suspense>
  )
}

function GasAndTokenPrices({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const dispatch = useDispatch<AppDispatch>()
  const { chainId, library } = useActiveWeb3React()

  const fetchAndUpdateGasPrice = useCallback(() => {
    void fetchGasPrices(dispatch)
  }, [dispatch])
  const fetchAndUpdateTokensPrice = useCallback(() => {
    fetchTokenPricesUSD(dispatch, chainId, library)
  }, [dispatch, chainId, library])
  const fetchAndUpdateSwapStats = useCallback(() => {
    void fetchSwapStats(dispatch)
  }, [dispatch])
  usePoller(fetchAndUpdateGasPrice, BLOCK_TIME)
  usePoller(fetchAndUpdateTokensPrice, BLOCK_TIME * 3)
  usePoller(fetchAndUpdateSwapStats, BLOCK_TIME * 280) // ~ 1hr
  return <>{children}</>
}
