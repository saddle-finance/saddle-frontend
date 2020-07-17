import { call, delay, put, select, takeEvery } from 'redux-saga/effects'

import { ethers } from 'ethers'

import {
  setAccount,
  setProvider,
  setSigner,
  CONNECT_METAMASK,
} from '../actions'
import { State } from '../reducers'

declare global {
  interface Window { ethereum: any }
}

export function* watchConnectProvider() {
  yield takeEvery(CONNECT_METAMASK, enableAccount)
}

export function* checkAccountEnabled() {
  if (window.ethereum !== undefined) {
    yield put(setProvider(new ethers.providers.Web3Provider(window.ethereum)))
    // give MetaMask et al a bit to load
    yield delay(500)
    if (window.ethereum.selectedAddress) {
      yield put(setAccount(window.ethereum.selectedAddress))
      let provider = yield select((s : State) => s.wallet.provider)
      yield put(setSigner(provider.getSigner()))
    }
  }
}

function* enableAccount() {
  yield* checkAccountEnabled()

  let { provider, account } = yield select((s : State) => s.wallet)
  if (window.ethereum !== undefined && !account) {
    const accounts : string[] = yield call(window.ethereum.enable)
    yield put(setAccount(accounts[0]))
    yield put(setSigner(provider.getSigner()))
  }
}
