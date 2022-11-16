import { PayloadAction, createSlice } from "@reduxjs/toolkit"

import { BigNumber } from "@ethersproject/bignumber"

interface GasPrices {
  gasStandard?: number
  gasFast?: number
  gasInstant?: number
}
export type TokenPricesUSD = Partial<{
  [tokenAddr: string]: number
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
} & { sdlWethSushiPool?: SdlWethSushiPool }

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
  updateSdlWethSushiPool,
} = applicationSlice.actions

export default applicationSlice.reducer
