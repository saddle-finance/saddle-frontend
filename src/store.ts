import { applyMiddleware, createStore, compose } from "redux"
import createSagaMiddleware from "redux-saga"

import { rootReducers } from "./reducers"
import { rootSaga } from "./sagas"

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any
  }
}

const composeEnhancer =
  (process.env.NODE_ENV !== "production" &&
    window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"]) ||
  compose

const sagaMiddleware = createSagaMiddleware()

const initialState = {
  swaps: {
    all: [
      {
        name: "ETH",
        address: "0x",
        lpToken: {
          name: "Saddle ETH",
          symbol: "saddleETH",
          decimals: 18,
          address: "0x",
        },
        pooledTokens: [],
      },
      {
        name: "BTC",
        address: "0x",
        lpToken: {
          name: "Saddle BTC",
          symbol: "saddleBTC",
          decimals: 18,
          address: "0x",
        },
        pooledTokens: [],
      },
      {
        name: "USD",
        address: "0x",
        lpToken: {
          name: "Saddle USD",
          symbol: "saddleUSD",
          decimals: 18,
          address: "0x",
        },
        pooledTokens: [],
      },
    ],
  },
  wallet: {},
}

export const store = createStore(
  rootReducers,
  initialState,
  composeEnhancer(applyMiddleware(sagaMiddleware)),
)

sagaMiddleware.run(rootSaga)
