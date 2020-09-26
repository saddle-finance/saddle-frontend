import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit"
import createSagaMiddleware from "redux-saga"

import wallet from "./wallet"

import { rootSaga } from "../sagas"

const sagaMiddleware = createSagaMiddleware()

const store = configureStore({
  reducer: {
    wallet,
  },
  middleware: [
    ...getDefaultMiddleware({
      thunk: false,
      // TODO: is redux the right place to store the provider/signer?
      serializableCheck: {
        ignoredActions: ["wallet/setProvider", "wallet/setSigner"],
        ignoredPaths: ["wallet.provider", "wallet.signer"],
      },
      immutableCheck: {
        ignoredPaths: ["wallet.provider", "wallet.signer"],
      },
    }),
    sagaMiddleware,
  ],
})

sagaMiddleware.run(rootSaga)

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
