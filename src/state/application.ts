import { PayloadAction, createSlice } from "@reduxjs/toolkit"

import { BigNumber } from "@ethersproject/bignumber"
import { ChainId } from "../constants"
import { SwapStatsReponse } from "../utils/getSwapStats"

interface GasPrices {
  gasStandard?: number
  gasFast?: number
  gasInstant?: number
}
type PoolStats = {
  oneDayVolume: string
  apy: string
  tvl: string
  utilization: string
}
type SwapStats = {
  [chainId in ChainId]?: Partial<{
    [swapAddress: string]: PoolStats
  }>
}
export type TokenPricesUSD = Partial<{
  [tokenSymbol: string]: number
}>
interface LastTransactionTimes {
  [transactionType: string]: number
}

export type SdlWethSushiPool = {
  totalSupply: BigNumber
  wethReserve: BigNumber
  sdlReserve: BigNumber
} | null

type ApplicationState = GasPrices & { tokenPricesUSD?: TokenPricesUSD } & {
  lastTransactionTimes: LastTransactionTimes
} & { swapStats?: SwapStats } & { sdlWethSushiPool?: SdlWethSushiPool }

const initialState: ApplicationState = {
  lastTransactionTimes: {},
}

const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    updateGasPrices(state, action: PayloadAction<GasPrices>): void {
      const { gasStandard, gasFast, gasInstant } = action.payload
      state.gasStandard = gasStandard
      state.gasFast = gasFast
      state.gasInstant = gasInstant
    },
    updateTokensPricesUSD(state, action: PayloadAction<TokenPricesUSD>): void {
      state.tokenPricesUSD = action.payload
    },
    updateLastTransactionTimes(
      state,
      action: PayloadAction<LastTransactionTimes>,
    ): void {
      state.lastTransactionTimes = {
        ...state.lastTransactionTimes,
        ...action.payload,
      }
    },
    updateSwapStats(state, action: PayloadAction<SwapStatsReponse>): void {
      const formattedPayload = Object.keys(action.payload).reduce(
        (chainsAcc, chainId) => {
          const chainData = action.payload[chainId] as NonNullable<
            SwapStatsReponse[ChainId]
          >
          const processedChainData = Object.keys(chainData).reduce(
            (poolsAcc, poolAddress) => {
              const { APY, TVL, oneDayVolume: ODV } = chainData[poolAddress]
              if (isNaN(APY) || isNaN(TVL) || isNaN(ODV)) {
                return poolsAcc
              }
              const apy = APY.toFixed(18)
              const tvl = TVL.toFixed(18)
              const oneDayVolume = ODV.toFixed(18)
              const utilization = (TVL > 0 ? ODV / TVL : 0).toFixed(18)
              return {
                ...poolsAcc,
                [(poolAddress as string).toLowerCase()]: {
                  apy,
                  tvl,
                  oneDayVolume,
                  utilization,
                },
              }
            },
            {},
          )
          return {
            ...chainsAcc,
            [chainId]: processedChainData,
          }
        },
        {},
      )
      state.swapStats = formattedPayload
    },
    updateSdlWethSushiPool(
      state,
      action: PayloadAction<SdlWethSushiPool>,
    ): void {
      state.sdlWethSushiPool = action.payload
    },
  },
})

export const {
  updateGasPrices,
  updateTokensPricesUSD,
  updateLastTransactionTimes,
  updateSwapStats,
  updateSdlWethSushiPool,
} = applicationSlice.actions

export default applicationSlice.reducer
