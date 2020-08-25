import { Provider } from "@ethersproject/abstract-provider"
import { Signer } from "@ethersproject/abstract-signer"

export const CONNECT_METAMASK = "CONNECT_METAMASK"
export const METAMASK_CONNECTED = "METAMASK_CONNECTED"
export const METAMASK_DISCONNECTED = "METAMASK_DISCONNECTED"
export const SET_PROVIDER = "SET_PROVIDER"
export const SET_ACCOUNT = "SET_ACCOUNT"
export const SET_SIGNER = "SET_SIGNER"

export function connectMetamask(): WalletAction {
  return {
    type: CONNECT_METAMASK,
    payload: {},
  }
}

export function setAccount(account: string): WalletAction {
  return {
    type: SET_ACCOUNT,
    payload: { account },
  }
}

export function setSigner(signer: Signer): WalletAction {
  return {
    type: SET_SIGNER,
    payload: { signer },
  }
}

export function setProvider(provider: Provider): WalletAction {
  return {
    type: SET_PROVIDER,
    payload: { provider },
  }
}

export interface WalletAction {
  type:
    | "CONNECT_METAMASK"
    | "METAMASK_CONNECTED"
    | "METAMASK_DISCONNECTED"
    | "SET_PROVIDER"
    | "SET_ACCOUNT"
    | "SET_SIGNER"
  payload: any // eslint-disable-line
}
