import { PayloadAction, createSlice } from "@reduxjs/toolkit"

export enum SNAPSHOT_STATE {
  OPEN = "open",
  CLOSED = "closed",
}

export type Proposal = {
  id: string
  start: number
  state: SNAPSHOT_STATE
  title: string
}

export interface VoteEscrowSnapshots {
  snapshots: Proposal[]
}

const initialState: VoteEscrowSnapshots = {
  snapshots: [],
}

const voteEscrowSnapshotsSlice = createSlice({
  name: "voteEscrowSnapshots",
  initialState,
  reducers: {
    updateVoteEscrowSnapshots(
      state,
      action: PayloadAction<VoteEscrowSnapshots>,
    ): void {
      state.snapshots = action.payload.snapshots
    },
  },
})

export const { updateVoteEscrowSnapshots } = voteEscrowSnapshotsSlice.actions

export default voteEscrowSnapshotsSlice.reducer
