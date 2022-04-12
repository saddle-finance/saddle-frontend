import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit"
import { load, save } from "redux-localstorage-simple"
import user, { initialState as userInitialState } from "./user"

import application from "./application"
import { merge } from "lodash"

const PERSISTED_KEYS: string[] = ["user"]
const stateFromStorage = load({
  states: PERSISTED_KEYS,
})
const reducer = {
  application,
  user,
}
const store = configureStore({
  reducer,
  middleware: [
    ...getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredPaths: Object.keys(reducer).filter(
          (k) => !PERSISTED_KEYS.includes(k),
        ),
      },
    }),
    save({ states: PERSISTED_KEYS }),
  ],
  preloadedState: merge({}, { user: userInitialState }, stateFromStorage),
})

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
