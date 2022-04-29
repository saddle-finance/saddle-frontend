import "react-toastify/dist/ReactToastify.css"

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
import { styled, useTheme } from "@mui/material"

import { AppDispatch } from "../state"
import BasicPoolsProvider from "../providers/BasicPoolsProvider"
import CreatePool from "./CreatePool"
import Deposit from "./Deposit"
import MinichefProvider from "../providers/MinichefProvider"
import PendingSwapsProvider from "../providers/PendingSwapsProvider"
import Pools from "./Pools"
import RewardsBalancesProvider from "../providers/RewardsBalancesProvider"
import Swap from "./Swap"
import { ToastContainer } from "react-toastify"
import TokensProvider from "../providers/TokensProvider"
import TopMenu from "../components/TopMenu"
import UserStateProvider from "../providers/UserStateProvider"
import Version from "../components/Version"
import Web3ReactManager from "../components/Web3ReactManager"
import Withdraw from "./Withdraw"
import WrongNetworkModal from "../components/WrongNetworkModal"
import fetchGasPrices from "../utils/updateGasPrices"
import fetchSwapStats from "../utils/getSwapStats"
import fetchTokenPricesUSD from "../utils/updateTokenPrices"
import { useActiveWeb3React } from "../hooks"
import { useDispatch } from "react-redux"
import { useIntercom } from "react-use-intercom"
import usePoller from "../hooks/usePoller"

const VestingClaim = lazy(() => import("./VestingClaim"))
const Risk = lazy(() => import("./Risk"))

const AppContainer = styled("div")(({ theme }) => {
  const darkBackground =
    "linear-gradient(180deg, #000000, #070713 10%, #121334 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%), radial-gradient(50% 395.51% at 50% 4.9%, #121334 0%, #000000 100%)"
  const lightBackground =
    "linear-gradient(180deg, #FFFFFF, #FAF3CE 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%), radial-gradient(87.11% 100% at 50% 0%, #FFFFFF 0%, #FDF8DD 100%)"
  return {
    backgroundImage:
      theme.palette.mode === "light" ? lightBackground : darkBackground,
    minHeight: "100vh",
    minWidth: "100vw",
    marginRight: "calc(-1 * (100vw - 100%))",
    backgroundAttachment: "fixed",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  }
})
export default function App(): ReactElement {
  const { chainId } = useActiveWeb3React()
  const theme = useTheme()
  const { boot } = useIntercom()

  const pools = useMemo(() => {
    return Object.values(POOLS_MAP).filter(
      ({ addresses }) => chainId && addresses[chainId],
    )
  }, [chainId])

  useEffect(() => {
    boot()
  }, [boot])

  return (
    <Suspense fallback={null}>
      <Web3ReactManager>
        <BasicPoolsProvider>
          <MinichefProvider>
            <TokensProvider>
              <UserStateProvider>
                <GasAndTokenPrices>
                  <PendingSwapsProvider>
                    <RewardsBalancesProvider>
                      <AppContainer>
                        <TopMenu />
                        <Switch>
                          <Route exact path="/" component={Swap} />
                          <Route exact path="/pools" component={Pools} />
                          {pools.map(({ name }) => (
                            <Route
                              exact
                              path={`/pools/${name}/deposit`}
                              render={(props) => (
                                <Deposit {...props} poolName={name} />
                              )}
                              key={`${name}-name-deposit`}
                            />
                          ))}
                          {pools.map(({ name, route }) => (
                            <Route
                              exact
                              path={`/pools/${route}/deposit`}
                              render={(props) => (
                                <Deposit {...props} poolName={name} />
                              )}
                              key={`${route}-route-deposit`}
                            />
                          ))}
                          {pools.map(({ name }) => (
                            <Route
                              exact
                              path={`/pools/${name}/withdraw`}
                              render={(props) => (
                                <Withdraw {...props} poolName={name} />
                              )}
                              key={`${name}-name-withdraw`}
                            />
                          ))}
                          {pools.map(({ route, name }) => (
                            <Route
                              exact
                              path={`/pools/${route}/withdraw`}
                              render={(props) => (
                                <Withdraw {...props} poolName={name} />
                              )}
                              key={`${route}-route-withdraw`}
                            />
                          ))}
                          <Redirect from="/pools/:route/:action" to="/pools" />
                          <Route
                            exact
                            path="/pools/create"
                            component={CreatePool}
                          />
                          <Route exact path="/risk" component={Risk} />
                          <Route
                            exact
                            path="/vesting-claim"
                            component={VestingClaim}
                          />
                        </Switch>
                        <WrongNetworkModal />
                        <Version />
                        <ToastContainer
                          theme={
                            theme.palette.mode === "dark" ? "dark" : "light"
                          }
                          position="top-left"
                        />
                      </AppContainer>
                    </RewardsBalancesProvider>
                  </PendingSwapsProvider>
                </GasAndTokenPrices>
              </UserStateProvider>
            </TokensProvider>
          </MinichefProvider>
        </BasicPoolsProvider>
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
