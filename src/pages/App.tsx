import "react-toastify/dist/ReactToastify.css"
import "@rainbow-me/rainbowkit/styles.css"

import { AppDispatch, AppState } from "../state"
import { BLOCK_TIME, POOLS_MAP } from "../constants"
import {
  Chain,
  RainbowKitProvider,
  Theme,
  getDefaultWallets,
  midnightTheme,
} from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, {
  ReactElement,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
} from "react"
import { Redirect, Route, Switch } from "react-router-dom"
import {
  WagmiConfig,
  chain,
  configureChains,
  createClient as createWagmiClient,
} from "wagmi"
import { styled, useTheme } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import AprsProvider from "../providers/AprsProvider"
import BasicPoolsProvider from "../providers/BasicPoolsProvider"
import CreatePool from "./CreatePool"
import Deposit from "./Deposit"
import Farm from "./Farm/Farm"
import GaugeProvider from "../providers/GaugeProvider"
import { LocalizationProvider } from "@mui/x-date-pickers"
import MinichefProvider from "../providers/MinichefProvider"
import PendingSwapsProvider from "../providers/PendingSwapsProvider"
import Pools from "./Pools"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import RewardsBalancesProvider from "../providers/RewardsBalancesProvider"
import Swap from "./Swap"
import { ToastContainer } from "react-toastify"
import TokensProvider from "../providers/TokensProvider"
import TopMenu from "../components/TopMenu"
import UserStateProvider from "../providers/UserStateProvider"
import VeSDL from "./VeSDL"
import Version from "../components/Version"
// import Web3ReactManager from "../components/Web3ReactManager"
import Withdraw from "./Withdraw"
import WrongNetworkModal from "../components/WrongNetworkModal"
import { alchemyProvider } from "wagmi/providers/alchemy"
import fetchGasPrices from "../utils/updateGasPrices"
import fetchSdlWethSushiPoolInfo from "../utils/updateSdlWethSushiInfo"
import fetchSwapStats from "../utils/getSwapStats"
import fetchTokenPricesUSD from "../utils/updateTokenPrices"
// import { getDefaultProvider } from "ethers"
import getSnapshotVoteData from "../utils/getSnapshotVoteData"
import merge from "lodash.merge"
import { publicProvider } from "wagmi/providers/public"
import { useActiveWeb3React } from "../hooks"
import { useIntercom } from "react-use-intercom"
import usePoller from "../hooks/usePoller"
import { useSdlWethSushiPairContract } from "../hooks/useContract"

const avalancheChain: Chain = {
  id: 43_114,
  name: "Avalanche",
  network: "avalanche",
  iconUrl:
    "https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png?1604021818",
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "Avalanche",
    symbol: "AVAX",
  },
  rpcUrls: {
    default: "https://api.avax.network/ext/bc/C/rpc",
  },
  blockExplorers: {
    default: { name: "SnowTrace", url: "https://snowtrace.io" },
    etherscan: { name: "SnowTrace", url: "https://snowtrace.io" },
  },
  testnet: false,
}

const { chains, provider } = configureChains(
  [
    chain.mainnet,
    chain.optimism,
    chain.arbitrum,
    chain.hardhat,
    avalancheChain,
  ],
  [alchemyProvider({ alchemyId: process.env.ALCHEMY_ID }), publicProvider()],
)

const { connectors } = getDefaultWallets({
  appName: "Saddle Exchange",
  chains,
})

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

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        suspense: true,
      },
    },
  })

  const wagmiClient = createWagmiClient({
    autoConnect: true,
    connectors,
    provider,
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen />
      <Suspense fallback={null}>
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider
            coolMode
            showRecentTransactions
            theme={merge(midnightTheme(), {
              colors: {
                accentColor: "#4B11F2",
                accentColorForeground: "white",
                connectButtonBackground: "#4B11F2",
              },
              fonts: {
                body: "Source Code Pro, monospace, sans-serif",
              },
            } as Theme)}
            chains={chains}
          >
            <BasicPoolsProvider>
              <MinichefProvider>
                <GaugeProvider>
                  <TokensProvider>
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
                                          <Withdraw
                                            {...props}
                                            poolName={name}
                                          />
                                        )}
                                        key={`${name}-name-withdraw`}
                                      />
                                    ))}
                                    {pools.map(({ route, name }) => (
                                      <Route
                                        exact
                                        path={`/pools/${route}/withdraw`}
                                        render={(props) => (
                                          <Withdraw
                                            {...props}
                                            poolName={name}
                                          />
                                        )}
                                        key={`${route}-route-withdraw`}
                                      />
                                    ))}
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
                  </TokensProvider>
                </GaugeProvider>
              </MinichefProvider>
            </BasicPoolsProvider>{" "}
          </RainbowKitProvider>
        </WagmiConfig>
      </Suspense>
    </QueryClientProvider>
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
