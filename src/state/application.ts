import { PayloadAction, createSlice } from "@reduxjs/toolkit"

import { BigNumber } from "@ethersproject/bignumber"
import { SwapStatsReponse } from "../utils/getSwapStats"
import { parseUnits } from "@ethersproject/units"

interface GasPrices {
  gasStandard?: number
  gasFast?: number
  gasInstant?: number
}
interface SwapStats {
  [swapAddress: string]: {
    oneDayVolume: BigNumber
    apy: BigNumber
    tvl: BigNumber
    utilization: BigNumber
  }
}
export interface TokenPricesUSD {
  [tokenSymbol: string]: number
}
interface LastTransactionTimes {
  [transactionType: string]: number
}

type ApplicationState = GasPrices & { tokenPricesUSD?: TokenPricesUSD } & {
  lastTransactionTimes: LastTransactionTimes
} & { swapStats?: SwapStats }

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
        (acc, key) => {
          const { APY, TVL, oneDayVolume: ODV } = action.payload[key]
          if (isNaN(APY) || isNaN(TVL) || isNaN(ODV)) {
            return acc
          }
          const apy = parseUnits(APY.toFixed(18), 18)
          const tvl = parseUnits(TVL.toFixed(18), 18)
          const oneDayVolume = parseUnits(ODV.toFixed(18), 18)
          return {
            ...acc,
            [key]: {
              apy,
              tvl,
              oneDayVolume,
              utilization: oneDayVolume
                .mul(BigNumber.from(10).pow(18))
                .div(tvl), // 1e18
            },
          }
        },
        {},
      )
      state.swapStats = formattedPayload
    },
  },
})

export const {
  updateGasPrices,
  updateTokensPricesUSD,
  updateLastTransactionTimes,
  updateSwapStats,
} = applicationSlice.actions

export default applicationSlice.reducer
