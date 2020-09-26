import { call, delay, put, select, takeEvery } from "redux-saga/effects"

import { ethers } from "ethers"

import {
  setAccount,
  setProvider,
  setSigner,
  connectMetamask,
} from "../state/wallet"
import { AppState } from "../state"

declare global {
  interface Window {
    ethereum: any
  }
}

export function* checkAccountEnabled() {
  if (window.ethereum !== undefined) {
    yield put(setProvider(new ethers.providers.Web3Provider(window.ethereum)))
    // give MetaMask et al a bit to load
    yield delay(500)
    if (window.ethereum.selectedAddress) {
      yield put(setAccount(window.ethereum.selectedAddress))
      const provider = yield select((s: AppState) => s.wallet.provider)
      yield put(setSigner(provider.getSigner()))
    }
  }
}

function* enableAccount() {
  yield* checkAccountEnabled()

  const { provider, account } = yield select((s: AppState) => s.wallet)
  if (window.ethereum !== undefined && !account) {
    const accounts: string[] = yield call(window.ethereum.enable)
    yield put(setAccount(accounts[0]))
    yield put(setSigner(provider.getSigner()))
  }
}

export function* watchConnectProvider() {
  yield takeEvery(connectMetamask, enableAccount)
}
