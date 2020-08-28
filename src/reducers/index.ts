import { combineReducers } from "redux"
import { walletReducer, WalletState } from "./wallet"

import { swapReducer, SwapState } from "./swap"

export interface State {
  wallet: WalletState
  swaps: SwapState
}

export const rootReducers = combineReducers<State>({
  wallet: walletReducer,
  swaps: swapReducer,
})
