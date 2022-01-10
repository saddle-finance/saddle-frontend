import {
  BLOCK_TIME,
  ChainId,
  IS_VIRTUAL_SWAP_ACTIVE,
  SWAP_TYPES,
  Token,
} from "../constants"
import { useCallback, useEffect, useState } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import { Bridge } from "../../types/ethers-contracts/Bridge"
import { Event } from "ethers"
import { Zero } from "@ethersproject/constants"
import { getTokenByAddress } from "../utils"
import { omit } from "lodash"
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
  transactionHash: string
  timestamp: number
  events: Array<SettlementEvent | WithdrawEvent>
}

interface SwapEvent {
  timestamp: number
  itemId: string
  transactionHash: string // used for deduping
  type: "settlement" | "withdraw"
}
export interface SettlementEvent extends SwapEvent {
  fromToken: Token
  fromAmount: BigNumber
  toToken: Token
  toAmount: BigNumber
  type: "settlement"
}
export interface WithdrawEvent extends SwapEvent {
  synthToken: Token
  amount: BigNumber
  type: "withdraw"
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

type BridgeEventWithdraw = {
  requester: string
  itemId: BigNumber
  synth: string
  synthAmount: BigNumber
  isFinal: boolean
}

type BridgeEventGenericSwap = {
  requester: string
  itemId: BigNumber
  // other fields exist but we don't use them
}

type State = {
  pendingSwaps: Omit<PendingSwap, "events">[]
  settlements: { [itemId: string]: SettlementEvent[] }
  withdraws: { [itemId: string]: WithdrawEvent[] }
}

const VIRTUAL_SWAP_TOPICS = [
  "TokenToSynth",
  "SynthToToken",
  "TokenToToken",
] as const
const SETTLE = "Settle"
const WITHDRAW = "Withdraw"

const usePendingSwapData = (): PendingSwap[] => {
  const { account, chainId, library } = useActiveWeb3React()
  const bridgeContract = useBridgeContract()
  const [state, setState] = useState<State>({
    pendingSwaps: [],
    settlements: {},
    withdraws: {},
  })
  const queryStartBlock =
    chainId === ChainId.HARDHAT
      ? 0
      : -1 * Math.round((365 * 24 * 60 * 60 * 1000) / BLOCK_TIME) // approx number of blocks in 1 year

  // update the secondsRemaining every 15s
  useEffect(() => {
    const timer = setInterval(() => {
      void library?.getBlock("latest").then(({ timestamp }) => {
        // block timestamp in secs
        setState((prevState) => {
          const shouldUpdateState = prevState.pendingSwaps.some(
            ({ secondsRemaining }) => secondsRemaining > 0,
          )
          if (!shouldUpdateState) return prevState
          return {
            ...prevState,
            pendingSwaps: prevState.pendingSwaps.map((swap) => {
              let secondsRemaining = Math.floor(
                swap.settleableAtTimestamp / 1000 - timestamp,
              )
              secondsRemaining = Math.max(secondsRemaining, 0)
              return { ...swap, secondsRemaining }
            }),
          }
        })
      })
    }, 15 * 1000)
    return () => {
      clearInterval(timer)
    }
  }, [library])
  const pendingSwapEventListener = useCallback(
    (...listenerArgs) => {
      const event = listenerArgs[listenerArgs.length - 1] as Event
      const itemIdArg = event.args?.itemId as BigNumber | null
      if (itemIdArg == null || bridgeContract == null || chainId == null) return
      const itemId = itemIdArg.toString()
      void fetchPendingSwapInfo(bridgeContract, event, chainId).then(
        (fetchedPendingSwap) => {
          if (fetchedPendingSwap == null) return
          setState((prevState) => {
            return {
              ...prevState,
              pendingSwaps: [
                ...prevState.pendingSwaps.filter(
                  ({ itemId: existingItemId }) => itemId !== existingItemId,
                ),
                fetchedPendingSwap,
              ],
            }
          })
        },
      )
    },
    [bridgeContract, chainId, setState],
  )
  const settleEventListener = useCallback(
    (...listenerArgs) => {
      const event = listenerArgs[listenerArgs.length - 1] as Event
      if (chainId == null) return
      void parseSettlementFromEvent(event, chainId).then((settlement) => {
        if (settlement == null) return
        setState((prevState) => {
          const pendingSwap = prevState.pendingSwaps.find(
            ({ itemId }) => itemId === settlement.itemId,
          )
          const newPendingSwapBalance = pendingSwap
            ? pendingSwap.synthBalance.sub(settlement.fromAmount)
            : Zero
          const prevSettlements = prevState.settlements[settlement.itemId] || []
          const txnsSet = new Set(
            prevSettlements.map(({ transactionHash }) => transactionHash),
          )
          if (newPendingSwapBalance.lte(Zero)) {
            // if this action empties the pending swap balance, remove it from state
            return removeItemFromState(prevState, settlement.itemId)
          } else if (!txnsSet.has(settlement.transactionHash)) {
            return {
              ...prevState,
              settlements: {
                ...prevState.settlements,
                [settlement.itemId]: prevSettlements.concat(settlement),
              },
            }
          } else {
            return prevState
          }
        })
      })
    },
    [chainId, setState],
  )
  const withdrawEventListener = useCallback(
    (...listenerArgs) => {
      const event = listenerArgs[listenerArgs.length - 1] as Event
      if (chainId == null) return
      void parseWithdrawFromEvent(event, chainId).then((withdraw) => {
        if (withdraw == null) return
        setState((prevState) => {
          const pendingSwap = prevState.pendingSwaps.find(
            ({ itemId }) => itemId === withdraw.itemId,
          )
          const newPendingSwapBalance = pendingSwap
            ? pendingSwap.synthBalance.sub(withdraw.amount)
            : Zero
          const prevWithdraws = prevState.withdraws[withdraw.itemId] || []
          const txnsSet = new Set(
            prevWithdraws.map(({ transactionHash }) => transactionHash),
          )
          if (newPendingSwapBalance.lte(Zero)) {
            // if this action empties the pending swap balance, remove it from state
            return removeItemFromState(prevState, withdraw.itemId)
          } else if (!txnsSet.has(withdraw.transactionHash)) {
            return {
              ...prevState,
              withdraws: {
                ...prevState.withdraws,
                [withdraw.itemId]: prevWithdraws.concat(withdraw),
              },
            }
          } else {
            return prevState
          }
        })
      })
    },
    [chainId, setState],
  )
  // attach listeners for events
  useEffect(() => {
    function attachPendingSwapEventListeners() {
      if (bridgeContract == null || account == null) return
      const virtualSwapTopicFilters = VIRTUAL_SWAP_TOPICS.map((topic) =>
        bridgeContract.filters[topic](account, null, null, null, null, null),
      )
      const settleFilter = bridgeContract.filters[SETTLE](
        account,
        null,
        null,
        null,
        null,
        null,
        null,
      )
      const withdrawFilter = bridgeContract.filters[WITHDRAW](
        account,
        null,
        null,
        null,
        null,
      )

      virtualSwapTopicFilters.forEach((filter) => {
        void bridgeContract.on(filter, pendingSwapEventListener)
      })
      bridgeContract.on(settleFilter, settleEventListener)
      bridgeContract.on(withdrawFilter, withdrawEventListener)
      return () => {
        virtualSwapTopicFilters.forEach((filter) => {
          void bridgeContract.off(filter, pendingSwapEventListener)
        })
        bridgeContract.off(settleFilter, settleEventListener)
        bridgeContract.off(withdrawFilter, withdrawEventListener)
      }
    }
    void attachPendingSwapEventListeners()
  }, [
    bridgeContract,
    account,
    settleEventListener,
    withdrawEventListener,
    pendingSwapEventListener,
  ])
  // initial fetch of events
  useEffect(() => {
    async function fetchExistingEvents() {
      if (!IS_VIRTUAL_SWAP_ACTIVE || !account || !bridgeContract || !chainId)
        return

      await Promise.all([
        fetchAndPopulatePendingSwaps(
          bridgeContract,
          setState,
          account,
          chainId,
          queryStartBlock,
        ),
        fetchAndPopulateWithdraws(
          bridgeContract,
          setState,
          account,
          chainId,
          queryStartBlock,
        ),
        fetchAndPopulateSettlements(
          bridgeContract,
          setState,
          account,
          chainId,
          queryStartBlock,
        ),
      ])
    }
    void fetchExistingEvents()
  }, [bridgeContract, setState, account, chainId, queryStartBlock])

  return state.pendingSwaps.map((swap) => {
    // merge swaps + settlements state
    return {
      ...swap,
      events: [
        ...(state.settlements[swap.itemId] || []),
        ...(state.withdraws[swap.itemId] || []),
      ].sort((a, b) => a.timestamp - b.timestamp),
    }
  })
}

async function fetchAndPopulatePendingSwaps(
  bridgeContract: Bridge,
  setState: (callback: (state: State) => State) => void,
  account: string,
  chainId: ChainId,
  startBlock: number,
): Promise<void> {
  // Step 1: create event filters
  const eventFilters = VIRTUAL_SWAP_TOPICS.map((topic) => {
    return bridgeContract.filters[topic](account, null, null, null, null, null)
  })
  // Step 2: run queries and get matching events
  let events
  events = await Promise.all(
    eventFilters.map((filter) =>
      bridgeContract.queryFilter(filter, startBlock, "latest"),
    ),
  )
  events = events.flat()

  // Step 3: fetch aync data via bridge contract
  let fetchedPendingSwaps = await Promise.all(
    events.map((event) => fetchPendingSwapInfo(bridgeContract, event, chainId)),
  )
  fetchedPendingSwaps = fetchedPendingSwaps.filter(Boolean)
  if (fetchedPendingSwaps.length === 0) return

  // Step 4: write to state
  setState((prevState) => {
    return {
      ...prevState,
      pendingSwaps: fetchedPendingSwaps as PendingSwap[],
    }
  })
}
async function fetchAndPopulateWithdraws(
  bridgeContract: Bridge,
  setState: (callback: (state: State) => State) => void,
  account: string,
  chainId: ChainId,
  startBlock: number,
): Promise<void> {
  // Step 1: create event filter
  const eventFilter = bridgeContract.filters[WITHDRAW](
    account,
    null,
    null,
    null,
    null,
  )

  // Step 2: run queries and get matching events
  const events = await bridgeContract.queryFilter(
    eventFilter,
    startBlock,
    "latest",
  )
  // Step 3: get each event's block
  const withdraws = await Promise.all(
    events.map((event) => parseWithdrawFromEvent(event, chainId)),
  )

  // Step 4: write to state
  if (withdraws.length === 0) return
  setState((prevState) => {
    const newState = { ...prevState }
    withdraws.forEach((withdraw) => {
      if (withdraw == null) return
      const existingWithdraws = newState.withdraws[withdraw.itemId]
      newState.withdraws[withdraw.itemId] = (existingWithdraws || []).concat(
        withdraw,
      )
    })
    return newState
  })
}
async function fetchAndPopulateSettlements(
  bridgeContract: Bridge,
  setState: (callback: (state: State) => State) => void,
  account: string,
  chainId: ChainId,
  startBlock: number,
): Promise<void> {
  // Step 1: create event filter
  const eventFilter = bridgeContract.filters[SETTLE](
    account,
    null,
    null,
    null,
    null,
    null,
    null,
  )

  // Step 2: run queries and get matching events
  const events = await bridgeContract.queryFilter(
    eventFilter,
    startBlock,
    "latest",
  )
  // Step 3: get each event's block
  const settlements = await Promise.all(
    events.map((event) => parseSettlementFromEvent(event, chainId)),
  )

  // Step 4: write to state
  if (settlements.length === 0) return
  setState((prevState) => {
    const newState = { ...prevState }
    settlements.forEach((settlement) => {
      if (settlement == null) return
      const existingSettlements = newState.settlements[settlement.itemId]
      newState.settlements[settlement.itemId] = (
        existingSettlements || []
      ).concat(settlement)
    })
    return newState
  })
}

async function parseSettlementFromEvent(
  event: Event,
  chainId: ChainId,
): Promise<SettlementEvent | null> {
  // Settlements are final
  const settlement = event.args as unknown as BridgeEventSettle // TODO would love to set this from the typechain type
  if (settlement == null) return null
  const fromToken = getTokenByAddress(settlement.settleFrom, chainId)
  const toToken = getTokenByAddress(settlement.settleTo, chainId)
  if (fromToken == null || toToken == null) return null
  return event
    .getBlock()
    .then(({ timestamp }) => {
      return {
        fromAmount: settlement.settleFromAmount,
        fromToken,
        itemId: settlement.itemId.toString(),
        timestamp,
        toAmount: settlement.settleToAmount,
        toToken,
        transactionHash: event.transactionHash,
        type: "settlement" as const,
      }
    })
    .catch(() => null)
}

async function parseWithdrawFromEvent(
  event: Event,
  chainId: ChainId,
): Promise<WithdrawEvent | null> {
  const withdraw = event.args as unknown as BridgeEventWithdraw
  if (withdraw == null) return null
  const synthToken = getTokenByAddress(withdraw.synth, chainId)
  if (synthToken == null) return null
  return event
    .getBlock()
    .then(({ timestamp }) => {
      return {
        amount: withdraw.synthAmount,
        itemId: withdraw.itemId.toString(),
        synthToken,
        timestamp, // in seconds
        transactionHash: event.transactionHash,
        type: "withdraw",
      } as WithdrawEvent
    })
    .catch(() => null)
}

enum BridgePendingSwapTypes {
  Null,
  TokenToSynth,
  SynthToToken,
  TokenToToken,
}
async function fetchPendingSwapInfo(
  bridgeContract: Bridge,
  event: Event,
  chainId: ChainId,
) {
  let result = null
  try {
    // this will throw if the itemId has already fully resolved
    // afik we don't have a better way of fetching current pendingSwaps
    // DEVELOPER: for this reason we don't use multicall
    const pendingSwap = event.args as unknown as BridgeEventGenericSwap
    if (pendingSwap == null) return null
    const itemId = pendingSwap.itemId.toString()
    const [pendingSwapInfo, eventBlock] = await Promise.all([
      bridgeContract.getPendingSwapInfo(itemId),
      event.getBlock(),
    ])
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
      (eventBlock.timestamp + parseInt(pendingSwapInfo.secsLeft.toString())) * // add event block timestamp + secsLeft
      1000 // convert to ms
    let secondsRemaining = Math.ceil(
      (settleableAtTimestamp - Date.now()) / 1000,
    )
    secondsRemaining = Math.max(secondsRemaining, 0)
    result = {
      swapType,
      settleableAtTimestamp,
      secondsRemaining,
      synthBalance: pendingSwapInfo.synthBalance,
      itemId,
      synthTokenFrom: synthTokenFrom,
      tokenTo: tokenTo,
      transactionHash: event.transactionHash,
      timestamp: eventBlock.timestamp,
    }
  } catch {
    // do nothing because this is probably okay
  }
  return result
}

function removeItemFromState(state: State, itemId: string): State {
  return {
    settlements: omit(state.settlements, itemId),
    withdraws: omit(state.withdraws, itemId),
    pendingSwaps: state.pendingSwaps.filter(({ itemId }) => itemId !== itemId),
  }
}

export default usePendingSwapData
