import { PayloadAction, createSlice } from "@reduxjs/toolkit"

interface GasPrices {
  gasStandard?: number
  gasFast?: number
  gasInstant?: number
}
interface TokenPricesUSD {
  [tokenSymbol: string]: number
}

type ApplicationState = {} & GasPrices & { tokenPricesUSD?: TokenPricesUSD }

const initialState: ApplicationState = {}

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
  },
})

export const {
  updateGasPrices,
  updateTokensPricesUSD,
} = applicationSlice.actions

export default applicationSlice.reducer
