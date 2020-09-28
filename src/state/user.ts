import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface UserState {
  advancedMode: boolean
}

const initialState: UserState = {
  advancedMode: false,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUserAdvancedMode(state, action: PayloadAction<boolean>) {
      state.advancedMode = action.payload
    },
  },
})

export const { updateUserAdvancedMode } = userSlice.actions

export default userSlice.reducer
