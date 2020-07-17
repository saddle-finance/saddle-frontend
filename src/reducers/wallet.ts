import { Provider } from '@ethersproject/abstract-provider'
import { Signer } from '@ethersproject/abstract-signer'

import { METAMASK_DISCONNECTED, SET_ACCOUNT, SET_PROVIDER, SET_SIGNER, WalletAction} from '../actions'

export interface WalletState {
  provider?: Provider,
  account?: string,
  signer?: Signer
}

export const walletReducer = (
  state: WalletState = {},
  action : WalletAction
) => {
  switch(action.type) {
    case SET_ACCOUNT:
      return { ...state, account: action.payload.account }
    case SET_PROVIDER:
      return { ...state, provider: action.payload.provider }
    case SET_SIGNER:
      return { ...state, signer: action.payload.signer }
    case METAMASK_DISCONNECTED:
      return {}
  }
  return state
}
