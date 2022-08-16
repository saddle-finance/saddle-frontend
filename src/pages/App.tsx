import "@rainbow-me/rainbowkit/styles.css"
import "react-toastify/dist/ReactToastify.css"

import { AppDispatch, AppState } from "../state"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, {
  ReactElement,
  Suspense,
  lazy,
  useCallback,
  useEffect,
} from "react"
import { Redirect, Route, Switch } from "react-router-dom"
import { styled, useTheme } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import AprsProvider from "../providers/AprsProvider"
import { BLOCK_TIME } from "../constants"
import BasicPoolsProvider from "../providers/BasicPoolsProvider"
import CoinbasePayTest from "./CoinbasePayTest"
import ExpandedPoolsProvider from "../providers/ExpandedPoolsProvider"
import GaugeProvider from "../providers/GaugeProvider"
import { LocalizationProvider } from "@mui/x-date-pickers"
import MinichefProvider from "../providers/MinichefProvider"
import PendingSwapsProvider from "../providers/PendingSwapsProvider"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import RewardsBalancesProvider from "../providers/RewardsBalancesProvider"
import Swap from "./Swap"
import { ToastContainer } from "react-toastify"
import TokensProvider from "../providers/TokensProvider"
import TopMenu from "../components/TopMenu"
import UserStateProvider from "../providers/UserStateProvider"
import Version from "../components/Version"
import { WagmiConfig } from "wagmi"
import Web3ReactManager from "../components/Web3ReactManager"
import WrongNetworkModal from "../components/WrongNetworkModal"
import fetchGasPrices from "../utils/updateGasPrices"
import fetchSdlWethSushiPoolInfo from "../utils/updateSdlWethSushiInfo"
import fetchSwapStats from "../utils/getSwapStats"
import fetchTokenPricesUSD from "../utils/updateTokenPrices"
import getSnapshotVoteData from "../utils/getSnapshotVoteData"
import { useIntercom } from "react-use-intercom"
import { useNetwork } from "wagmi"
import usePoller from "../hooks/usePoller"
import { useSdlWethSushiPairContract } from "../hooks/useContract"
import { wagmiClient } from "../constants/networks"

// Lazy Loaded Pages
const CreatePool = lazy(() => import("./CreatePool"))
const Deposit = lazy(() => import("./Deposit"))
const Farm = lazy(() => import("./Farm/Farm"))
const Pools = lazy(() => import("./Pools"))
const Risk = lazy(() => import("./Risk"))
const VeSDL = lazy(() => import("./VeSDL"))
const VestingClaim = lazy(() => import("./VestingClaim"))
const Withdraw = lazy(() => import("./Withdraw"))

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
})

export default function App(): ReactElement {
  const theme = useTheme()
  const { boot } = useIntercom()
  useEffect(() => {
    boot()
  }, [boot])

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <WagmiConfig client={wagmiClient}>
        <Suspense fallback={null}>
          <Web3ReactManager>
            <BasicPoolsProvider>
              <MinichefProvider>
                <GaugeProvider>
                  <TokensProvider>
                    <ExpandedPoolsProvider>
                      <UserStateProvider>
                        <PricesAndVoteData>
                          <PendingSwapsProvider>
                            <AprsProvider>
                              <RewardsBalancesProvider>
                                <LocalizationProvider
                                  dateAdapter={AdapterDateFns}
                                >
                                  <AppContainer>
                                    <TopMenu />
                                    <Switch>
                                      <Route exact path="/" component={Swap} />
                                      <Route
                                        exact
                                        path="/pools"
                                        component={Pools}
                                      />
                                      <Route
                                        exact
                                        path={`/pools/:poolName/deposit`}
                                        component={Deposit}
                                      />
                                      <Route
                                        exact
                                        path={`/pools/:poolName/withdraw`}
                                        component={Withdraw}
                                      />
                                      <Redirect
                                        from="/pools/:route/:action"
                                        to="/pools"
                                      />
                                      <Route
                                        exact
                                        path="/pools/create"
                                        component={CreatePool}
                                      />
                                      <Route
                                        exact
                                        path="/risk"
                                        component={Risk}
                                      />
                                      <Route
                                        exact
                                        path="/vesting-claim"
                                        component={VestingClaim}
                                      />
                                      <Route
                                        exact
                                        path="/farm"
                                        component={Farm}
                                      />
                                      <Route
                                        exact
                                        path="/vesdl"
                                        component={VeSDL}
                                      />
                                      <Route
                                        exact
                                        path="/coinbase-pay-test"
                                        component={CoinbasePayTest}
                                      />
                                    </Switch>
                                    <WrongNetworkModal />
                                    <Version />
                                    <ToastContainer
                                      theme={theme.palette.mode}
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
            </BasicPoolsProvider>
          </Web3ReactManager>
        </Suspense>
      </WagmiConfig>
    </QueryClientProvider>
  )
}

function PricesAndVoteData({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const dispatch = useDispatch<AppDispatch>()
  const sdlWethSushiPoolContract = useSdlWethSushiPairContract()
  const { chain } = useNetwork()
  const { sdlWethSushiPool } = useSelector(
    (state: AppState) => state.application,
  )

  const fetchAndUpdateGasPrice = useCallback(() => {
    void fetchGasPrices(dispatch)
  }, [dispatch])
  const fetchAndUpdateTokensPrice = useCallback(() => {
    fetchTokenPricesUSD(dispatch, sdlWethSushiPool, chain?.id ?? 1)
  }, [dispatch, chain, sdlWethSushiPool])
  const fetchAndUpdateSwapStats = useCallback(() => {
    void fetchSwapStats(dispatch)
  }, [dispatch])
  const fetchAndUpdateSdlWethSushiPoolInfo = useCallback(() => {
    void fetchSdlWethSushiPoolInfo(
      dispatch,
      sdlWethSushiPoolContract,
      chain?.id ?? 1,
    )
  }, [dispatch, chain, sdlWethSushiPoolContract])

  useEffect(() => {
    void getSnapshotVoteData(dispatch)
  }, [dispatch])

  usePoller(fetchAndUpdateGasPrice, 5 * 1000)
  usePoller(fetchAndUpdateTokensPrice, BLOCK_TIME * 3)
  usePoller(fetchAndUpdateSdlWethSushiPoolInfo, BLOCK_TIME * 3)
  usePoller(fetchAndUpdateSwapStats, BLOCK_TIME * 280) // ~ 1hr
  return <>{children}</>
}
