import { PayloadAction, createSlice } from "@reduxjs/toolkit"

export enum GasPrices {
  Standard = "STANDARD",
  Fast = "FAST",
  Instant = "INSTANT",
  Custom = "CUSTOM",
}

interface GasState {
  gasStandard?: number
  gasFast?: number
  gasInstant?: number
}

type ApplicationState = {
  gasCustom?: number
  selectedGasPrice: GasPrices
} & GasState

const initialState: ApplicationState = {
  selectedGasPrice: GasPrices.Standard,
}

const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    updateGasPrices(state, action: PayloadAction<GasState>): void {
      const { gasStandard, gasFast, gasInstant } = action.payload
      state.gasStandard = gasStandard
      state.gasFast = gasFast
      state.gasInstant = gasInstant
    },
    updateCustomGasPrice(state, action: PayloadAction<number>): void {
      state.gasCustom = action.payload
    },
    updateSelectedGasPrice(state, action: PayloadAction<GasPrices>): void {
      state.selectedGasPrice = action.payload
    },
  },
})

export const {
  updateGasPrices,
  updateCustomGasPrice,
  updateSelectedGasPrice,
} = applicationSlice.actions

export default applicationSlice.reducer
