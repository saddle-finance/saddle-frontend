import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit"
import { load, save } from "redux-localstorage-simple"

import application from "./application"
import user from "./user"

const PERSISTED_KEYS: string[] = ["user"]

const store = configureStore({
  reducer: {
    application,
    user,
  },
  middleware: [
    ...getDefaultMiddleware({ thunk: false }),
    save({ states: PERSISTED_KEYS }),
  ],
  preloadedState: load({ states: PERSISTED_KEYS }),
})

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
