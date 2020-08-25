import { all, fork } from "redux-saga/effects"

import { checkAccountEnabled, watchConnectProvider } from "./wallet.saga"

export const rootSaga = function* root() {
  yield all([fork(checkAccountEnabled), fork(watchConnectProvider)])
}
