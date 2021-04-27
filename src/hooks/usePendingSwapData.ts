import { useEffect, useState } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import { Bridge } from "../../types/ethers-contracts/Bridge"
import { DEPLOYED_BLOCK } from "../constants"
import { Event } from "ethers"
import { hexZeroPad } from "@ethersproject/bytes"
import { useActiveWeb3React } from "./"
import { useBridgeContract } from "./useContract"

export interface PendingSwap {
  swapType: number
  secsLeft: BigNumber
  synth: string
  synthBalance: BigNumber
  tokenTo: string
  itemId?: BigNumber
}
const VIRTUAL_SWAP_TOPICS = [
  "TokenToSynth",
  "SynthToToken",
  "TokenToToken",
] as const

const usePendingSwapData = (): PendingSwap[] => {
  const { account, library, chainId } = useActiveWeb3React()
  const bridgeContract = useBridgeContract()
  const [pendingSwaps, setPendingSwaps] = useState<PendingSwap[]>([])
  const deployedBlock = chainId ? DEPLOYED_BLOCK[chainId] : 0

  useEffect(() => {
    async function fetchExistingPendingSwaps() {
      if (!account || !library || !bridgeContract) return
      const eventFilters = buildEventFilters(bridgeContract, account)
      let events
      events = await Promise.all(
        eventFilters.map((filter) =>
          bridgeContract.queryFilter(filter, deployedBlock, "latest"),
        ),
      )
      events = events.flat()
      const pendingSwapItemIds = events
        .map(({ args }) => args?.itemId as BigNumber | null)
        .filter(Boolean) as BigNumber[]
      const fetchedPendingSwaps = await Promise.all(
        pendingSwapItemIds.map((itemId) =>
          fetchPendingSwapInfo(bridgeContract, itemId),
        ),
      )
      setPendingSwaps(fetchedPendingSwaps.filter(Boolean) as PendingSwap[])
    }
    function attachPendingSwapEventListeners() {
      if (!account || !library || !bridgeContract) return
      const eventListener = (event: Event) => {
        const newItemId = event.args?.itemId as BigNumber | null
        if (newItemId == null) return
        void fetchPendingSwapInfo(bridgeContract, newItemId).then(
          (fetchedPendingSwap) => {
            if (fetchedPendingSwap == null) return
            setPendingSwaps((existingState) => {
              // TODO: is deduping correct here?
              return [
                fetchedPendingSwap,
                ...existingState.filter(({ itemId }) => itemId !== newItemId),
              ]
            })
          },
        )
      }
      VIRTUAL_SWAP_TOPICS.forEach((topic) => {
        void bridgeContract.on(topic, eventListener)
      })
      return () => {
        VIRTUAL_SWAP_TOPICS.forEach((topic) => {
          bridgeContract.off(topic, eventListener)
        })
      }
    }
    void attachPendingSwapEventListeners()
    void fetchExistingPendingSwaps()
  }, [account, library, chainId, bridgeContract, deployedBlock])
  return pendingSwaps
}

/**
 * Create filters for each PendingSwap type
 */
function buildEventFilters(bridgeContract: Bridge, account: string) {
  const args = [hexZeroPad(account, 32), null, null, null, null, null] as const
  return VIRTUAL_SWAP_TOPICS.map((topic) =>
    bridgeContract.filters[topic](...args),
  )
}

async function fetchPendingSwapInfo(bridgeContract: Bridge, itemId: BigNumber) {
  let pendingSwapInfo = null
  try {
    // this will throw if the itemId has already fully resolved
    // afik we don't have a better way of fetching current pendingSwaps
    pendingSwapInfo = await bridgeContract.getPendingSwapInfo(itemId)
    pendingSwapInfo = { ...pendingSwapInfo, itemId }
  } catch {
    // do nothing because this is probably okay
  }
  return pendingSwapInfo
}

export default usePendingSwapData
