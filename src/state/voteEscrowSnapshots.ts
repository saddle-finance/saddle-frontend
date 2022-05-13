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
    getVoteEscrowSnapshots(
      state,
      action: PayloadAction<VoteEscrowSnapshots>,
    ): void {
      state.snapshots = [...state.snapshots, ...action.payload.snapshots]
    },
  },
})

export const { getVoteEscrowSnapshots } = voteEscrowSnapshotsSlice.actions

export default voteEscrowSnapshotsSlice.reducer
