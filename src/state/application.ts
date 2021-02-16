import { PayloadAction, createSlice } from "@reduxjs/toolkit"

interface GasPrices {
  gasStandard?: number
  gasFast?: number
  gasInstant?: number
}
export interface TokenPricesUSD {
  [tokenSymbol: string]: number
}
interface LastTransactionTimes {
  [transactionType: string]: number
}

type ApplicationState = GasPrices & { tokenPricesUSD?: TokenPricesUSD } & {
  lastTransactionTimes: LastTransactionTimes
}

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
  },
})

export const {
  updateGasPrices,
  updateTokensPricesUSD,
  updateLastTransactionTimes,
} = applicationSlice.actions

export default applicationSlice.reducer
