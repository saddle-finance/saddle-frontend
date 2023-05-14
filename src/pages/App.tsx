import "@rainbow-me/rainbowkit/styles.css"
import "react-toastify/dist/ReactToastify.css"

import { AppDispatch, AppState } from "../state"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { ReactElement, useCallback, useEffect } from "react"
import { WagmiConfig, useChainId } from "wagmi"
import { chains, wagmiConfig } from "../connectors/config"
import { useDispatch, useSelector } from "react-redux"

import AppContainer from "./AppContainer"
import AprsProvider from "../providers/AprsProvider"
import { BLOCK_TIME } from "../constants"
import BasicPoolsProvider from "../providers/BasicPoolsProvider"
import ExpandedPoolsProvider from "../providers/ExpandedPoolsProvider"
import GaugeProvider from "../providers/GaugeProvider"
import MinichefProvider from "../providers/MinichefProvider"
import PendingSwapsProvider from "../providers/PendingSwapsProvider"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import RewardsBalancesProvider from "../providers/RewardsBalancesProvider"
import TokensProvider from "../providers/TokensProvider"
import UserStateProvider from "../providers/UserStateProvider"
import Web3ReactManager from "../components/Web3ReactManager"
import fetchGasPrices from "../utils/updateGasPrices"
import fetchSdlWethSushiPoolInfo from "../utils/updateSdlWethSushiInfo"
import fetchTokenPricesUSD from "../utils/updateTokenPrices"
import getSnapshotVoteData from "../utils/getSnapshotVoteData"
import usePoller from "../hooks/usePoller"
import { useSdlWethSushiPairContract } from "../hooks/useContract"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
})

export default function App(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
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
                                <AppContainer />
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
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  )
}

function PricesAndVoteData({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const dispatch = useDispatch<AppDispatch>()
  const sdlWethSushiPoolContract = useSdlWethSushiPairContract()
  const chainId = useChainId()
  const { sdlWethSushiPool } = useSelector(
    (state: AppState) => state.application,
  )

  const fetchAndUpdateGasPrice = useCallback(() => {
    void fetchGasPrices(dispatch)
  }, [dispatch])
  const fetchAndUpdateTokensPrice = useCallback(() => {
    fetchTokenPricesUSD(dispatch, sdlWethSushiPool, chainId)
  }, [dispatch, chainId, sdlWethSushiPool])
  const fetchAndUpdateSdlWethSushiPoolInfo = useCallback(() => {
    void fetchSdlWethSushiPoolInfo(dispatch, sdlWethSushiPoolContract, chainId)
  }, [dispatch, chainId, sdlWethSushiPoolContract])

  useEffect(() => {
    void getSnapshotVoteData(dispatch)
  }, [dispatch])

  usePoller(fetchAndUpdateGasPrice, BLOCK_TIME * 3)
  usePoller(fetchAndUpdateTokensPrice, BLOCK_TIME * 10)
  usePoller(fetchAndUpdateSdlWethSushiPoolInfo, BLOCK_TIME * 10)
  return <>{children}</>
}
