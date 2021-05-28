import {
  BLOCK_TIME,
  ChainId,
  IS_VIRTUAL_SWAP_ACTIVE,
  SWAP_TYPES,
  Token,
} from "../constants"
import { useEffect, useState } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import { Bridge } from "../../types/ethers-contracts/Bridge"
import { Event } from "ethers"
import { getTokenByAddress } from "../utils"
import { useActiveWeb3React } from "./"
import { useBridgeContract } from "./useContract"

export interface PendingSwap {
  swapType: SWAP_TYPES
  settleableAtTimestamp: Date
  secondsRemaining: number
  synthTokenFrom: Token
  synthBalance: BigNumber
  tokenTo: Token
  itemId: BigNumber
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
  const queryStartBlock =
    chainId === ChainId.HARDHAT
      ? 0
      : -1 * Math.round((365 * 24 * 60 * 60 * 1000) / BLOCK_TIME) // approx number of blocks in 1 year

  // update the secondsRemaining every 15s
  useEffect(() => {
    const timer = setInterval(() => {
      setPendingSwaps((swaps) =>
        swaps.map((swap) => {
          let secondsRemaining = Math.floor(
            (swap.settleableAtTimestamp.getTime() - Date.now()) / 1000,
          )
          secondsRemaining = secondsRemaining > 0 ? secondsRemaining : 0
          return { ...swap, secondsRemaining }
        }),
      )
    }, 15 * 1000)
    return () => {
      clearInterval(timer)
    }
  }, [])
  useEffect(() => {
    async function fetchExistingPendingSwaps() {
      if (
        !IS_VIRTUAL_SWAP_ACTIVE ||
        !account ||
        !library ||
        !bridgeContract ||
        !chainId
      )
        return
      // Step 1: build the filters to query for
      const eventFilters = buildEventFilters(bridgeContract, account)

      // Step 2: run queries and get matching events
      let events
      events = await Promise.all(
        eventFilters.map((filter) =>
          bridgeContract.queryFilter(filter, queryStartBlock, "latest"),
        ),
      )
      events = events.flat()
      const eventBlocks = await Promise.all(
        events.map((event) => event.getBlock()),
      )

      // Step 3: for each event, fetch the full pendingSwap from the contract
      const pendingSwapItemIdsAndTimestamps = events
        .map(({ args }, i) => [
          args?.itemId as BigNumber | null,
          eventBlocks[i].timestamp, // in seconds
        ])
        .filter(([itemId]) => Boolean(itemId)) as [BigNumber, number][]
      const fetchedPendingSwaps = await Promise.all(
        pendingSwapItemIdsAndTimestamps.map(([itemId, timestampInSeconds]) =>
          fetchPendingSwapInfo(
            bridgeContract,
            itemId,
            timestampInSeconds,
            chainId,
          ),
        ),
      )

      // Step 4: write to state
      setPendingSwaps(fetchedPendingSwaps.filter(Boolean) as PendingSwap[])
    }
    function attachPendingSwapEventListeners() {
      if (
        !IS_VIRTUAL_SWAP_ACTIVE ||
        !account ||
        !library ||
        !bridgeContract ||
        !chainId
      )
        return

      const eventListener = (event: Event) => {
        const newItemId = event.args?.itemId as BigNumber | null
        if (newItemId == null) return
        void event.getBlock().then((block) => {
          void fetchPendingSwapInfo(
            bridgeContract,
            newItemId,
            block.timestamp,
            chainId,
          ).then((fetchedPendingSwap) => {
            if (fetchedPendingSwap == null) return
            setPendingSwaps((existingState) => {
              return [
                fetchedPendingSwap,
                ...existingState.filter(({ itemId }) => itemId !== newItemId),
              ]
            })
          })
        })
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
  }, [account, library, chainId, bridgeContract, queryStartBlock])
  return pendingSwaps
}

/**
 * Create filters for each PendingSwap type
 */
function buildEventFilters(bridgeContract: Bridge, account: string) {
  return VIRTUAL_SWAP_TOPICS.map((topic) => {
    return bridgeContract.filters[topic](account, null, null, null, null, null)
  })
}

enum BridgePendingSwapTypes {
  Null,
  TokenToSynth,
  SynthToToken,
  TokenToToken,
}
async function fetchPendingSwapInfo(
  bridgeContract: Bridge,
  itemId: BigNumber,
  timestampInSeconds: number, // in seconds
  chainId: ChainId,
) {
  let result = null
  try {
    // this will throw if the itemId has already fully resolved
    // afik we don't have a better way of fetching current pendingSwaps
    // DEVELOPER: for this reason we don't use multicall
    const pendingSwapInfo = await bridgeContract.getPendingSwapInfo(itemId)
    const pendingSwapType = pendingSwapInfo.swapType
    let swapType
    if (pendingSwapType === BridgePendingSwapTypes.TokenToSynth) {
      swapType = SWAP_TYPES.TOKEN_TO_SYNTH
    } else if (pendingSwapType === BridgePendingSwapTypes.SynthToToken) {
      swapType = SWAP_TYPES.SYNTH_TO_TOKEN
    } else if (pendingSwapType === BridgePendingSwapTypes.TokenToToken) {
      swapType = SWAP_TYPES.TOKEN_TO_TOKEN
    } else {
      swapType = SWAP_TYPES.INVALID
    }
    const synthTokenFrom = getTokenByAddress(
      pendingSwapInfo.synth,
      chainId,
    ) as Token
    const tokenTo = getTokenByAddress(pendingSwapInfo.tokenTo, chainId) as Token
    const settleableAtTimestamp = new Date(
      (timestampInSeconds + parseInt(pendingSwapInfo.secsLeft.toString())) * // add event block timestamp + secsLeft
        1000, // convert to ms
    )
    result = {
      swapType,
      settleableAtTimestamp,
      secondsRemaining: Math.ceil(
        (Date.now() - settleableAtTimestamp.getTime()) / 1000,
      ),
      synthBalance: pendingSwapInfo.synthBalance,
      itemId,
      synthTokenFrom: synthTokenFrom,
      tokenTo: tokenTo,
    }
  } catch {
    // do nothing because this is probably okay
  }
  return result
}

export default usePendingSwapData
