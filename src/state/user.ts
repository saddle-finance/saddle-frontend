import {
  NumberInputState,
  numberInputStateCreator,
} from "../utils/numberInputState"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

import { BigNumber } from "@ethersproject/bignumber"
import { PoolName } from "../constants"

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

interface HistoricalPoolDataSerialized {
  lastBlockSeen: number
  name: string
  totalDepositsUSD: string
  totalWithdrawalsUSD: string
  totalProfitUSD: string
  totalDepositsBTC: string
  totalWithdrawalsBTC: string
  totalProfitBTC: string
}

interface HistoricalPoolDataDeserialized {
  lastBlockSeen: number
  name: string
  totalDepositsUSD: BigNumber
  totalWithdrawalsUSD: BigNumber
  totalProfitUSD: BigNumber
  totalDepositsBTC: BigNumber
  totalWithdrawalsBTC: BigNumber
  totalProfitBTC: BigNumber
}

type HistoricalPoolDataStateSerialized = {
  [poolName in PoolName]?: HistoricalPoolDataSerialized
}
type HistoricalPoolDataStateDeserialized = {
  [poolName in PoolName]?: HistoricalPoolDataDeserialized
}

interface UserState {
  userSwapAdvancedMode: boolean
  userPoolAdvancedMode: boolean
  userDarkMode: boolean
  gasCustom?: NumberInputState
  gasPriceSelected: GasPrices
  slippageCustom?: NumberInputState
  slippageSelected: Slippages
  infiniteApproval: boolean
  historicalPoolData: HistoricalPoolDataStateSerialized
}

const initialState: UserState = {
  userSwapAdvancedMode: false,
  userPoolAdvancedMode: false,
  userDarkMode: false,
  gasPriceSelected: GasPrices.Standard,
  slippageSelected: Slippages.OneTenth,
  infiniteApproval: false,
  historicalPoolData: {},
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
    updateSwapAdvancedMode(
      state: UserState,
      action: PayloadAction<boolean>,
    ): void {
      state.userSwapAdvancedMode = action.payload
    },
    updatePoolAdvancedMode(
      state: UserState,
      action: PayloadAction<boolean>,
    ): void {
      state.userPoolAdvancedMode = action.payload
    },
    updateDarkMode(state: UserState, action: PayloadAction<boolean>): void {
      state.userDarkMode = action.payload
    },
    updateGasPriceCustom(
      state: UserState,
      action: PayloadAction<string>,
    ): void {
      state.gasCustom = gasCustomStateCreator(action.payload)
    },
    updateGasPriceSelected(
      state: UserState,
      action: PayloadAction<GasPrices>,
    ): void {
      state.gasPriceSelected = action.payload
      if (action.payload !== GasPrices.Custom) {
        // clear custom value when standard option selected
        state.gasCustom = gasCustomStateCreator("")
      }
    },
    updateSlippageSelected(
      state: UserState,
      action: PayloadAction<Slippages>,
    ): void {
      state.slippageSelected = action.payload
      if (action.payload !== Slippages.Custom) {
        // clear custom value when standard option selected
        state.slippageCustom = slippageCustomStateCreator("")
      }
    },
    updateSlippageCustom(
      state: UserState,
      action: PayloadAction<string>,
    ): void {
      state.slippageCustom = slippageCustomStateCreator(action.payload)
    },
    updateInfiniteApproval(
      state: UserState,
      action: PayloadAction<boolean>,
    ): void {
      state.infiniteApproval = action.payload
    },
    updateHistoricalPoolData(
      state: UserState,
      action: PayloadAction<HistoricalPoolDataDeserialized>,
    ): void {
      state.historicalPoolData = {
        ...state.historicalPoolData,
        ...serializeHistoricalPoolData({
          [action.payload.name]: action.payload,
        }),
      }
    },
  },
})

const historicalPoolDataBNKeys: Set<
  keyof HistoricalPoolDataSerialized
> = new Set([
  "totalDepositsUSD",
  "totalWithdrawalsUSD",
  "totalProfitUSD",
  "totalDepositsBTC",
  "totalWithdrawalsBTC",
  "totalProfitBTC",
])

export function deserializeHistoricalPoolData(
  serializedData: HistoricalPoolDataStateSerialized,
): HistoricalPoolDataStateDeserialized {
  console.log("deserializeHistoricalPoolData", serializedData)
  const deserializedData: HistoricalPoolDataStateDeserialized = (Object.keys(
    serializedData,
  ) as Array<keyof HistoricalPoolDataStateSerialized>).reduce(
    (poolsAcc, poolName) => {
      const poolData = serializedData[poolName]
      if (poolData) {
        poolsAcc[poolName] = (Object.keys(poolData) as Array<
          keyof HistoricalPoolDataSerialized
        >).reduce(
          (acc, key) => ({
            ...acc,
            [key]: historicalPoolDataBNKeys.has(key)
              ? BigNumber.from(poolData[key])
              : poolData[key],
          }),
          {} as HistoricalPoolDataDeserialized,
        )
      }
      return poolsAcc
    },
    {} as HistoricalPoolDataStateDeserialized,
  )
  return deserializedData
}

export function serializeHistoricalPoolData(
  deserializedData: HistoricalPoolDataStateDeserialized,
): HistoricalPoolDataStateSerialized {
  const serializedData: HistoricalPoolDataStateSerialized = (Object.keys(
    deserializedData,
  ) as Array<keyof HistoricalPoolDataStateDeserialized>).reduce(
    (poolsAcc, poolName) => {
      const poolData = deserializedData[poolName]
      if (poolData) {
        poolsAcc[poolName] = (Object.keys(poolData) as Array<
          keyof HistoricalPoolDataDeserialized
        >).reduce(
          (acc, key) => ({
            ...acc,
            [key]: historicalPoolDataBNKeys.has(key)
              ? poolData[key].toString()
              : poolData[key],
          }),
          {} as HistoricalPoolDataSerialized,
        )
      }
      return poolsAcc
    },
    {} as HistoricalPoolDataStateSerialized,
  )
  return serializedData
}

export const {
  updateSwapAdvancedMode,
  updatePoolAdvancedMode,
  updateDarkMode,
  updateGasPriceCustom,
  updateGasPriceSelected,
  updateSlippageCustom,
  updateSlippageSelected,
  updateInfiniteApproval,
  updateHistoricalPoolData,
} = userSlice.actions

export default userSlice.reducer
