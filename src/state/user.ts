import { PayloadAction, createSlice } from "@reduxjs/toolkit"

export enum GasPrices {
  Standard = "STANDARD",
  Fast = "FAST",
  Instant = "INSTANT",
  Custom = "CUSTOM",
}

interface UserState {
  userSwapAdvancedMode: boolean
  userPoolAdvancedMode: boolean
  gasCustom?: number
  selectedGasPrice: GasPrices
}

const initialState: UserState = {
  userSwapAdvancedMode: false,
  userPoolAdvancedMode: false,
  selectedGasPrice: GasPrices.Standard,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateSwapAdvancedMode(state, action: PayloadAction<boolean>): void {
      state.userSwapAdvancedMode = action.payload
    },
    updatePoolAdvancedMode(state, action: PayloadAction<boolean>): void {
      state.userPoolAdvancedMode = action.payload
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
  updateSwapAdvancedMode,
  updatePoolAdvancedMode,
  updateCustomGasPrice,
  updateSelectedGasPrice,
} = userSlice.actions

export default userSlice.reducer
