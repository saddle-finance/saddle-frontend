import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { Provider } from "@ethersproject/abstract-provider"
import { Signer } from "@ethersproject/abstract-signer"

interface WalletState {
  provider?: Provider
  account?: string
  signer?: Signer
}

const initialState: WalletState = {}

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setAccount(state, action: PayloadAction<string>) {
      state.account = action.payload
    },
    setProvider(state, action: PayloadAction<Provider>) {
      state.provider = action.payload
    },
    setSigner(state, action: PayloadAction<Signer>) {
      state.signer = action.payload
    },
    connectMetamask(state, action: PayloadAction) {
      // do nothing
    },
  },
})

export const {
  setAccount,
  setProvider,
  setSigner,
  connectMetamask,
} = walletSlice.actions

export default walletSlice.reducer
