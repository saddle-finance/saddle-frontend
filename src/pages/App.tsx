import "../styles/global.scss"
import "react-toastify/dist/ReactToastify.css"

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
import { Route, Routes } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"

import Deposit from "./Deposit"
import PendingSwapsProvider from "../providers/PendingSwapsProvider"
import Pools from "./Pools"
import RewardsBalancesProvider from "../providers/RewardsBalancesProvider"
import Swap from "./Swap"
import { ToastContainer } from "react-toastify"
import TopMenu from "../components/TopMenu"
import Version from "../components/Version"
import Web3ReactManager from "../components/Web3ReactManager"
import Withdraw from "./Withdraw"
import WrongNetworkModal from "../components/WrongNetworkModal"
import fetchGasPrices from "../utils/updateGasPrices"
import fetchSwapStats from "../utils/getSwapStats"
import fetchTokenPricesUSD from "../utils/updateTokenPrices"
import { styled } from "@mui/material"
import { useActiveWeb3React } from "../hooks"
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
    backgroundAttachment: "fixed",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  }
})
export default function App(): ReactElement {
  const { chainId } = useActiveWeb3React()
  const { userDarkMode } = useSelector((state: AppState) => state.user)
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
        <GasAndTokenPrices>
          <PendingSwapsProvider>
            <RewardsBalancesProvider>
              <AppContainer>
                <TopMenu />
                <Routes>
                  <Route path="/" element={<Swap />} />
                  <Route path="/pools" element={<Pools />} />
                  {pools.map(({ name, route }) => (
                    <Route
                      path={`pools/${route}/withdraw`}
                      element={<Withdraw poolName={name} />}
                      key={`${name}-withdraw`}
                    />
                  ))}
                  {pools.map(({ name, route }) => (
                    <Route
                      path={`pools/${route}/deposit`}
                      element={<Deposit poolName={name} />}
                      key={`${name}-deposit`}
                    />
                  ))}
                  <Route path="pools/*" element={<Pools />} />
                  <Route path="/risk" element={<Risk />} />
                  <Route path="/vesting-claim" element={<VestingClaim />} />
                </Routes>
                <WrongNetworkModal />
                <Version />
                <ToastContainer
                  theme={userDarkMode ? "dark" : "light"}
                  position="top-left"
                />
              </AppContainer>
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
