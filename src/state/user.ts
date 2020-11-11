import {
  NumberInputState,
  numberInputStateCreator,
} from "../utils/numberInputState"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

import { BigNumber } from "@ethersproject/bignumber"

export enum GasPrices {
  Standard = "STANDARD",
  Fast = "FAST",
  Instant = "INSTANT",
  Custom = "CUSTOM",
}

export enum Slippages {
  One = "ONE",
  OneTenth = "ONE_TENTH",
  Custom = "CUSTOM",
}

interface UserState {
  userSwapAdvancedMode: boolean
  userPoolAdvancedMode: boolean
  gasCustom?: NumberInputState
  gasPriceSelected: GasPrices
  slippageCustom?: NumberInputState
  slippageSelected: Slippages
}

const initialState: UserState = {
  userSwapAdvancedMode: false,
  userPoolAdvancedMode: false,
  gasPriceSelected: GasPrices.Standard,
  slippageSelected: Slippages.OneTenth,
}

const gasCustomStateCreator = numberInputStateCreator(
  0, // gas is in wei
  BigNumber.from(0),
)
const slippageCustomStateCreator = numberInputStateCreator(
  4,
  BigNumber.from(10).pow(4).mul(1),
)
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
    updateGasPriceCustom(state, action: PayloadAction<string>): void {
      state.gasCustom = gasCustomStateCreator(action.payload)
    },
    updateGasPriceSelected(state, action: PayloadAction<GasPrices>): void {
      state.gasPriceSelected = action.payload
    },
    updateSlippageSelected(state, action: PayloadAction<Slippages>): void {
      state.slippageSelected = action.payload
    },
    updateSlippageCustom(state, action: PayloadAction<string>): void {
      state.slippageCustom = slippageCustomStateCreator(action.payload)
    },
  },
})

export const {
  updateSwapAdvancedMode,
  updatePoolAdvancedMode,
  updateGasPriceCustom,
  updateGasPriceSelected,
  updateSlippageCustom,
  updateSlippageSelected,
} = userSlice.actions

export default userSlice.reducer
