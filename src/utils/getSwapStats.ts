import { AppDispatch } from "../state"
import { ChainId } from "./../constants/index"
import retry from "async-retry"
import { updateSwapStats } from "../state/application"

const swapStatsURI = "https://ipfs.saddle.exchange/swap-stats.json"

export type SwapStatsReponse = {
  [chainId in ChainId]?: {
    [swapAddress: string]: {
      oneDayVolume: number
      APY: number
      TVL: number
    }
  }
}

const fetchSwapStatsNow = (): Promise<SwapStatsReponse> =>
  fetch(`${swapStatsURI}`, { cache: "no-cache" })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) {
        return res.json()
      }
      throw new Error("Unable to fetch swap stats from IPFS")
    })
    .then((body: SwapStatsReponse) => {
      return body
    })

export default async function fetchSwapStats(
  dispatch: AppDispatch,
): Promise<void> {
  const dispatchUpdate = (swapStats: SwapStatsReponse) => {
    dispatch(updateSwapStats(swapStats))
  }
  await retry(() => fetchSwapStatsNow().then(dispatchUpdate), {
    retries: 3,
  })
}
