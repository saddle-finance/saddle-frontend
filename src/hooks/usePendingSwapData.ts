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
  settleableAtTimestamp: number
  secondsRemaining: number
  synthTokenFrom: Token
  synthBalance: BigNumber
  tokenTo: Token
  itemId: string
  settlements: Settlement[]
}
export interface Settlement {
  fromToken: Token
  fromAmount: BigNumber
  toToken: Token
  toAmount: BigNumber
  timestamp: number
}

type BridgeEventSettle = {
  requester: string
  itemId: BigNumber
  settleFrom: string
  settleFromAmount: BigNumber
  settleTo: string
  settleToAmount: BigNumber
  isFinal: boolean
}

const VIRTUAL_SWAP_TOPICS = [
  "TokenToSynth",
  "SynthToToken",
  "TokenToToken",
] as const
const SETTLE = "Settle"

const usePendingSwapData = (): PendingSwap[] => {
  const { account, library, chainId } = useActiveWeb3React()
  const bridgeContract = useBridgeContract()
  const [pendingSwaps, setPendingSwaps] = useState<
    Omit<PendingSwap, "settlements">[]
  >([])
  const [settlements, setSettlements] = useState<{
    [itemId: string]: Settlement[]
  }>({})
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
            (swap.settleableAtTimestamp - Date.now()) / 1000,
          )
          secondsRemaining = Math.max(secondsRemaining, 0)
          return { ...swap, secondsRemaining }
        }),
      )
    }, 15 * 1000)
    return () => {
      clearInterval(timer)
    }
  }, [])
  // initial fetch + attach listener for events
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
            itemId.toString(),
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

      const pendingSwapEventListener = (event: Event) => {
        const itemIdArg = event.args?.itemId as BigNumber | null
        if (itemIdArg == null) return
        const itemId = itemIdArg.toString()
        void event.getBlock().then((block) => {
          void fetchPendingSwapInfo(
            bridgeContract,
            itemId,
            block.timestamp,
            chainId,
          ).then((fetchedPendingSwap) => {
            if (fetchedPendingSwap == null) return
            setPendingSwaps((existingState) => {
              return [
                fetchedPendingSwap,
                ...existingState.filter(
                  ({ itemId: existingItemId }) => itemId !== existingItemId,
                ),
              ]
            })
          })
        })
      }
      const settleEventListener = (event: Event) => {
        const settlement = (event.args as unknown) as BridgeEventSettle // TODO would love to set this from the typechain type
        const fromToken = getTokenByAddress(settlement.settleFrom, chainId)
        const toToken = getTokenByAddress(settlement.settleTo, chainId)
        if (fromToken == null || toToken == null) return
        void event.getBlock().then(({ timestamp }) => {
          setSettlements((existingState) => {
            const newSettlement = {
              fromToken,
              fromAmount: settlement.settleFromAmount,
              toToken,
              toAmount: settlement.settleToAmount,
              timestamp,
            }
            const key = settlement.itemId.toString()
            return {
              ...existingState,
              [key]: (existingState[key] || []).concat(newSettlement),
            }
          })
        })
      }

      VIRTUAL_SWAP_TOPICS.forEach((topic) => {
        void bridgeContract.on(topic, pendingSwapEventListener)
      })
      bridgeContract.on(SETTLE, settleEventListener)
      return () => {
        VIRTUAL_SWAP_TOPICS.forEach((topic) => {
          bridgeContract.off(topic, pendingSwapEventListener)
        })
        bridgeContract.off(SETTLE, settleEventListener)
      }
    }
    void attachPendingSwapEventListeners()
    void fetchExistingPendingSwaps()
  }, [account, library, chainId, bridgeContract, queryStartBlock])
  return pendingSwaps.map((swap) => {
    // merge swaps + settlements state
    return {
      ...swap,
      settlements: (settlements[swap.itemId] || []).sort(
        (a, b) => a.timestamp - b.timestamp,
      ),
    }
  })
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
  itemId: string,
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
    const settleableAtTimestamp =
      (timestampInSeconds + parseInt(pendingSwapInfo.secsLeft.toString())) * // add event block timestamp + secsLeft
      1000 // convert to ms
    result = {
      swapType,
      settleableAtTimestamp,
      secondsRemaining: Math.ceil((Date.now() - settleableAtTimestamp) / 1000),
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
