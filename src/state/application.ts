import { PayloadAction, createSlice } from "@reduxjs/toolkit"

interface GasPrices {
  gasStandard?: number
  gasFast?: number
  gasInstant?: number
}

type ApplicationState = {} & GasPrices

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
  },
})

export const { updateGasPrices } = applicationSlice.actions

export default applicationSlice.reducer
