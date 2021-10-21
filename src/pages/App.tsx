import "../styles/global.scss"
import "./NotifyStyle.scss"

import { AppDispatch, AppState } from "../state"
import { BLOCK_TIME, POOLS_MAP } from "../constants"
import React, { ReactElement, Suspense, useCallback, useEffect } from "react"
import { Route, Switch } from "react-router-dom"
import { isChainSupportedByNotify, notify } from "../utils/notifyHandler"
import { useDispatch, useSelector } from "react-redux"

import Deposit from "./Deposit"
import { Passport } from "@arcxmoney/passport-js"
import PendingSwapsProvider from "../providers/PendingSwapsProvider"
import Pools from "./Pools"
import Risk from "./Risk"
import Swap from "./Swap"
import Version from "../components/Version"
import Web3ReactManager from "../components/Web3ReactManager"
import Withdraw from "./Withdraw"
import fetchGasPrices from "../utils/updateGasPrices"
import fetchSwapStats from "../utils/getSwapStats"
import fetchTokenPricesUSD from "../utils/updateTokenPrices"
import { useActiveWeb3React } from "../hooks"
import usePoller from "../hooks/usePoller"

export default function App(): ReactElement {
  const { chainId, account } = useActiveWeb3React()
  const { userDarkMode } = useSelector((state: AppState) => state.user)

  useEffect(() => {
    notify?.config({
      networkId: isChainSupportedByNotify(chainId) ? chainId : undefined,
      darkMode: userDarkMode,
    })
  }, [chainId, userDarkMode])
  console.log(account)
  return (
    <Suspense fallback={null}>
      {account && <Passport account={account} />}
      <Web3ReactManager>
        <GasAndTokenPrices>
          <PendingSwapsProvider>
            <Switch>
              <Route exact path="/" component={Swap} />
              <Route exact path="/pools" component={Pools} />
              {Object.values(POOLS_MAP).map(({ name, route }) => (
                <Route
                  exact
                  path={`/pools/${route}/deposit`}
                  render={(props) => <Deposit {...props} poolName={name} />}
                  key={`${name}-deposit`}
                />
              ))}
              {Object.values(POOLS_MAP).map(({ name, route }) => (
                <Route
                  exact
                  path={`/pools/${route}/withdraw`}
                  render={(props) => <Withdraw {...props} poolName={name} />}
                  key={`${name}-withdraw`}
                />
              ))}
              <Route exact path="/risk" component={Risk} />
            </Switch>
            <Version />
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
  usePoller(fetchAndUpdateGasPrice, 5 * 1000)
  usePoller(fetchAndUpdateTokensPrice, BLOCK_TIME * 3)
  usePoller(fetchAndUpdateSwapStats, BLOCK_TIME * 280) // ~ 1hr
  return <>{children}</>
}
