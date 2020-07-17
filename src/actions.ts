import { Provider } from '@ethersproject/abstract-provider'
import { Signer } from '@ethersproject/abstract-signer'

export const CONNECT_METAMASK = 'CONNECT_METAMASK'
export const METAMASK_CONNECTED = 'METAMASK_CONNECTED'
export const METAMASK_DISCONNECTED = 'METAMASK_DISCONNECTED'
export const SET_PROVIDER = 'SET_PROVIDER'
export const SET_ACCOUNT = 'SET_ACCOUNT'
export const SET_SIGNER = 'SET_SIGNER'

export function connectMetamask() {
  return {
    type: CONNECT_METAMASK
  }
}

export function setAccount(account: string) {
  return {
    type: SET_ACCOUNT,
    payload: { account }
  }
}

export function setSigner(signer: Signer) {
  return {
    type: SET_SIGNER,
    payload: { signer }
  }
}

export function setProvider(provider: Provider) {
  return {
    type: SET_PROVIDER,
    payload: { provider }
  }
}

export interface WalletAction {
  type: ('CONNECT_METAMASK' | 'METAMASK_CONNECTED' | 'METAMASK_DISCONNECTED' |
         'SET_PROVIDER' | 'SET_ACCOUNT' | 'SET_SIGNER'),
  payload: any,
}
