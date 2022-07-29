import "react-toastify/dist/ReactToastify.css"

import { AppDispatch, AppState } from "../state"
import React, {
  ReactElement,
  Suspense,
  lazy,
  useCallback,
  useContext,
  useEffect,
} from "react"
import { Redirect, Route, Switch } from "react-router-dom"
import { styled, useTheme } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import AprsProvider from "../providers/AprsProvider"
import { BLOCK_TIME } from "../constants"
import { BasicPoolsContext } from "../providers/BasicPoolsProvider"
import CreatePool from "./CreatePool"
import Deposit from "./Deposit"
import ExpandedPoolsProvider from "../providers/ExpandedPoolsProvider"
import Farm from "./Farm/Farm"
import GaugeProvider from "../providers/GaugeProvider"
import { LocalizationProvider } from "@mui/x-date-pickers"
import MinichefProvider from "../providers/MinichefProvider"
import PendingSwapsProvider from "../providers/PendingSwapsProvider"
import Pools from "./Pools"
import RewardsBalancesProvider from "../providers/RewardsBalancesProvider"
import Swap from "./Swap"
import { ToastContainer } from "react-toastify"
import TokensProvider from "../providers/TokensProvider"
import TopMenu from "../components/TopMenu"
import UserStateProvider from "../providers/UserStateProvider"
import VeSDL from "./VeSDL"
import Version from "../components/Version"
import Web3ReactManager from "../components/Web3ReactManager"
import Withdraw from "./Withdraw"
import WrongNetworkModal from "../components/WrongNetworkModal"
import fetchGasPrices from "../utils/updateGasPrices"
import fetchSdlWethSushiPoolInfo from "../utils/updateSdlWethSushiInfo"
import fetchSwapStats from "../utils/getSwapStats"
import fetchTokenPricesUSD from "../utils/updateTokenPrices"
import getSnapshotVoteData from "../utils/getSnapshotVoteData"
import { useActiveWeb3React } from "../hooks"
import { useIntercom } from "react-use-intercom"
import usePoller from "../hooks/usePoller"
import { useSdlWethSushiPairContract } from "../hooks/useContract"

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
  const theme = useTheme()
  const basicPools = useContext(BasicPoolsContext)
  const pools = Object.values(basicPools || {})

  const { boot } = useIntercom()
  useEffect(() => {
    boot()
  }, [boot])

  return (
    <Suspense fallback={null}>
      <Web3ReactManager>
        <MinichefProvider>
          <GaugeProvider>
            <TokensProvider>
              <ExpandedPoolsProvider>
                <UserStateProvider>
                  <PricesAndVoteData>
                    <PendingSwapsProvider>
                      <AprsProvider>
                        <RewardsBalancesProvider>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <AppContainer>
                              <TopMenu />
                              <Switch>
                                <Route exact path="/" component={Swap} />
                                <Route exact path="/pools" component={Pools} />
                                {pools.map((pool) => (
                                  <Route
                                    exact
                                    path={`/pools/${pool.poolName}/deposit`}
                                    render={(props) => (
                                      <Deposit
                                        {...props}
                                        poolName={pool.poolName}
                                      />
                                    )}
                                    key={`${pool.poolName}-deposit`}
                                  />
                                ))}
                                {pools.map((pool) => (
                                  <Route
                                    exact
                                    path={`/pools/${pool.poolName}/withdraw`}
                                    render={(props) => (
                                      <Withdraw
                                        {...props}
                                        poolName={pool.poolName}
                                      />
                                    )}
                                    key={`${pool.poolName}-withdraw`}
                                  />
                                ))}
                                {basicPools && (
                                  <Redirect
                                    from="/pools/:route/:action"
                                    to="/pools"
                                  />
                                )}
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
                                <Route exact path="/farm" component={Farm} />
                                <Route exact path="/vesdl" component={VeSDL} />
                              </Switch>
                              <WrongNetworkModal />
                              <Version />
                              <ToastContainer
                                theme={
                                  theme.palette.mode === "dark"
                                    ? "dark"
                                    : "light"
                                }
                                position="top-left"
                              />
                            </AppContainer>
                          </LocalizationProvider>
                        </RewardsBalancesProvider>
                      </AprsProvider>
                    </PendingSwapsProvider>
                  </PricesAndVoteData>
                </UserStateProvider>
              </ExpandedPoolsProvider>
            </TokensProvider>
          </GaugeProvider>
        </MinichefProvider>
      </Web3ReactManager>
    </Suspense>
  )
}

function PricesAndVoteData({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const dispatch = useDispatch<AppDispatch>()
  const sdlWethSushiPoolContract = useSdlWethSushiPairContract()
  const { chainId } = useActiveWeb3React()
  const { sdlWethSushiPool } = useSelector(
    (state: AppState) => state.application,
  )

  const fetchAndUpdateGasPrice = useCallback(() => {
    void fetchGasPrices(dispatch)
  }, [dispatch])
  const fetchAndUpdateTokensPrice = useCallback(() => {
    fetchTokenPricesUSD(dispatch, sdlWethSushiPool, chainId)
  }, [dispatch, chainId, sdlWethSushiPool])
  const fetchAndUpdateSwapStats = useCallback(() => {
    void fetchSwapStats(dispatch)
  }, [dispatch])
  const fetchAndUpdateSdlWethSushiPoolInfo = useCallback(() => {
    void fetchSdlWethSushiPoolInfo(dispatch, sdlWethSushiPoolContract, chainId)
  }, [dispatch, chainId, sdlWethSushiPoolContract])

  useEffect(() => {
    void getSnapshotVoteData(dispatch)
  }, [dispatch])

  usePoller(fetchAndUpdateGasPrice, 5 * 1000)
  usePoller(fetchAndUpdateTokensPrice, BLOCK_TIME * 3)
  usePoller(fetchAndUpdateSdlWethSushiPoolInfo, BLOCK_TIME * 3)
  usePoller(fetchAndUpdateSwapStats, BLOCK_TIME * 280) // ~ 1hr
  return <>{children}</>
}
