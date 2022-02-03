import "../styles/global.scss"
import "./NotifyStyle.scss"

import { AppDispatch, AppState } from "../state"
import { BLOCK_TIME, POOLS_MAP } from "../constants"
import React, {
  ReactElement,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
} from "react"
import { Redirect, Route, Switch } from "react-router-dom"
import { isChainSupportedByNotify, notify } from "../utils/notifyHandler"
import { useDispatch, useSelector } from "react-redux"

import Deposit from "./Deposit"
import PendingSwapsProvider from "../providers/PendingSwapsProvider"
import Pools from "./Pools"
import RewardsBalancesProvider from "../providers/RewardsBalancesProvider"
import { SnackbarContextProvider } from "../providers/SnackbarProvider"
import Swap from "./Swap"
import TopMenu from "../components/TopMenu"
import Version from "../components/Version"
import Web3ReactManager from "../components/Web3ReactManager"
import Withdraw from "./Withdraw"
import WrongNetworkModal from "../components/WrongNetworkModal"
import fetchGasPrices from "../utils/updateGasPrices"
import fetchSwapStats from "../utils/getSwapStats"
import fetchTokenPricesUSD from "../utils/updateTokenPrices"
import { useActiveWeb3React } from "../hooks"
import usePoller from "../hooks/usePoller"

const VestingClaim = lazy(() => import("./VestingClaim"))
const Risk = lazy(() => import("./Risk"))

export default function App(): ReactElement {
  const { chainId } = useActiveWeb3React()
  const { userDarkMode } = useSelector((state: AppState) => state.user)

  useEffect(() => {
    notify?.config({
      networkId: isChainSupportedByNotify(chainId) ? chainId : undefined,
      darkMode: userDarkMode,
    })
  }, [chainId, userDarkMode])
  const pools = useMemo(() => {
    return Object.values(POOLS_MAP).filter(
      ({ addresses }) => chainId && addresses[chainId],
    )
  }, [chainId])
  return (
    <Suspense fallback={null}>
      <Web3ReactManager>
        <GasAndTokenPrices>
          <PendingSwapsProvider>
            <RewardsBalancesProvider>
              <SnackbarContextProvider>
                <TopMenu />

                <Switch>
                  <Route exact path="/" component={Swap} />
                  <Route exact path="/pools" component={Pools} />
                  {pools.map(({ name, route }) => (
                    <Route
                      exact
                      path={`/pools/${route}/deposit`}
                      render={(props) => <Deposit {...props} poolName={name} />}
                      key={`${name}-deposit`}
                    />
                  ))}
                  {pools.map(({ name, route }) => (
                    <Route
                      exact
                      path={`/pools/${route}/withdraw`}
                      render={(props) => (
                        <Withdraw {...props} poolName={name} />
                      )}
                      key={`${name}-withdraw`}
                    />
                  ))}
                  <Redirect from="/pools/:route/:action" to="/pools" />
                  <Route exact path="/risk" component={Risk} />
                  <Route exact path="/vesting-claim" component={VestingClaim} />
                </Switch>
                <WrongNetworkModal />
                <Version />
              </SnackbarContextProvider>
            </RewardsBalancesProvider>
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
