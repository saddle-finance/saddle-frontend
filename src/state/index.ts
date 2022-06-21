import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit"
import { load, save } from "redux-localstorage-simple"
import user, { initialState as userInitialState } from "./user"

import application from "./application"
import { merge } from "lodash"
import voteEscrowSnapshots from "./voteEscrowSnapshots"

const PERSISTED_KEYS: string[] = ["user"]
const stateFromStorage = load({
  states: PERSISTED_KEYS,
})
const reducer = {
  application,
  user,
  voteEscrowSnapshots,
}
const store = configureStore({
  reducer,
  middleware: [
    ...getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredActions: ["application/updateSdlWethSushiPool"],
        ignoredPaths: ["application.sdlWethSushiPool"],
      },
    }),
    save({ states: PERSISTED_KEYS }),
  ],
  preloadedState: merge({}, { user: userInitialState }, stateFromStorage),
})

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
