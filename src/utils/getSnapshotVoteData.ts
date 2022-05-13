import {
  Proposal,
  VoteEscrowSnapshots,
  getVoteEscrowSnapshots,
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
      first: 20,
      skip: 0,
      where: {
        space_in: ["saddlefinance.eth"],
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
    .then((result: Response) =>
      result.data.proposals
        .filter((proposal) =>
          proposal.title.toLowerCase().includes("gauge reward allocation vote"),
        )
        // Only grab the first 10
        .slice(0, 10),
    )
    .then((proposals) => {
      const voteEscrowSnapshots = extractSnapshotInfoFromProposals(proposals)
      dispatch(getVoteEscrowSnapshots(voteEscrowSnapshots))
    })
}

function extractSnapshotInfoFromProposals(
  proposals: Proposal[],
): VoteEscrowSnapshots {
  const voteEscrowSnapshots: VoteEscrowSnapshots = {
    snapshots: [],
  }

  voteEscrowSnapshots.snapshots = proposals.map(
    ({ id, start, state, title }) => {
      return {
        id,
        start,
        state,
        title,
      }
    },
  )
  return voteEscrowSnapshots
}
