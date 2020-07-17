import { combineReducers } from 'redux'

import {
  walletReducer,
  WalletState,
} from './wallet'

export interface State {
  wallet: WalletState
}

export const rootReducers = combineReducers<State>({
  wallet: walletReducer,
})
