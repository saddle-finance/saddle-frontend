import {
  Proposal,
  updateVoteEscrowSnapshots,
} from "../state/voteEscrowSnapshots"

import { AppDispatch } from "../state"

interface Response {
  data: {
    proposals: Proposal[]
  }
}

export default function getSnapshotVoteData(
  dispatch: AppDispatch,
): Promise<void> {
  const SNAPSHOT_API_URL = "https://hub.snapshot.org/graphql"
  /**
   * If more fields are needed, refer to https://docs.snapshot.org/graphql-api#proposals
   * and add them into the query below
   */
  const query = `{
    proposals (
      first: 10,
      skip: 0,
      where: {
        space_in: ["saddlefinance.eth"],
        title_contains: "Gauge reward allocation"
      },
      orderBy: "created",
      orderDirection: desc
    ) {
      id
      title
      start
      state
    }
  }`

  return fetch(SNAPSHOT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })
    .then((res) => res.json())
    .then(
      (result: Response) =>
        void dispatch(
          updateVoteEscrowSnapshots({ snapshots: result.data.proposals }),
        ),
    )
    .catch((e) => {
      const error = new Error(
        `Unable to get Snapshot vote data \n${(e as Error).message}`,
      )
      error.stack = (e as Error).stack
      console.error(error)
      return Promise.resolve()
    })
}
