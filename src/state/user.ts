import { PayloadAction, createSlice } from "@reduxjs/toolkit"

interface UserState {
  userSwapAdvancedMode: boolean
  userPoolAdvancedMode: boolean
}

const initialState: UserState = {
  userSwapAdvancedMode: false,
  userPoolAdvancedMode: false,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUserSwapAdvancedMode(state, action: PayloadAction<boolean>) {
      state.userSwapAdvancedMode = action.payload
    },
    updateUserPoolAdvancedMode(state, action: PayloadAction<boolean>) {
      state.userPoolAdvancedMode = action.payload
    },
  },
})

export const {
  updateUserSwapAdvancedMode,
  updateUserPoolAdvancedMode,
} = userSlice.actions

export default userSlice.reducer
