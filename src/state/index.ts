import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit"

import user from "./user"

const store = configureStore({
  reducer: {
    user,
  },
  middleware: [...getDefaultMiddleware({ thunk: false })],
})

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
