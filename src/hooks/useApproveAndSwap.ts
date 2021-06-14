import {
  POOLS_MAP,
  SWAP_TYPES,
  TOKENS_MAP,
  TRANSACTION_TYPES,
} from "../constants"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { Bridge } from "../../types/ethers-contracts/Bridge"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { GasPrices } from "../state/user"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { SwapFlashLoanNoWithdrawFee } from "../../types/ethers-contracts/SwapFlashLoanNoWithdrawFee"
import { SwapGuarded } from "../../types/ethers-contracts/SwapGuarded"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { formatDeadlineToNumber } from "../utils"
import { getFormattedTimeString } from "../utils/dateTime"
import { parseUnits } from "@ethersproject/units"
import { subtractSlippage } from "../utils/slippage"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useAllContracts } from "./useContract"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { useToast } from "./useToast"
import { utils } from "ethers"

type Contracts = {
  swapContract: SwapFlashLoan | SwapFlashLoanNoWithdrawFee | SwapGuarded | null
  bridgeContract: Bridge | null
}
type SwapSide = {
  amount: BigNumber
  symbol: string
  poolName: string
  tokenIndex: number
}
type FormState = {
  from: SwapSide
  to: SwapSide & { amountMediumSynth: BigNumber }
  swapType: Exclude<SWAP_TYPES, SWAP_TYPES.INVALID>
}
type ApproveAndSwapStateArgument = FormState & Contracts

export function useApproveAndSwap(): (
  state: ApproveAndSwapStateArgument,
) => Promise<void> {
  const dispatch = useDispatch()
  const tokenContracts = useAllContracts()
  const { account, chainId } = useActiveWeb3React()
  const { addToast, clearToasts } = useToast()
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const {
    slippageCustom,
    slippageSelected,
    gasPriceSelected,
    gasCustom,
    transactionDeadlineCustom,
    transactionDeadlineSelected,
    infiniteApproval,
  } = useSelector((state: AppState) => state.user)
  return async function approveAndSwap(
    state: ApproveAndSwapStateArgument,
  ): Promise<void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (state.swapType === SWAP_TYPES.DIRECT && !state.swapContract)
        throw new Error("Swap contract is not loaded")
      if (state.swapType !== SWAP_TYPES.DIRECT && !state.bridgeContract)
        throw new Error("Bridge contract is not loaded")
      if (chainId === undefined) throw new Error("Unknown chain")
      const tokenFrom = TOKENS_MAP[state.from.symbol]
      // For each token being deposited, check the allowance and approve it if necessary
      const tokenContract = tokenContracts?.[state.from.symbol] as Erc20
      if (tokenContract == null) return
      await checkAndApproveTokenForTrade(
        tokenContract,
        (state.swapType === SWAP_TYPES.DIRECT
          ? state.swapContract?.address
          : state.bridgeContract?.address) as string,
        account,
        state.from.amount,
        infiniteApproval,
        {
          onTransactionStart: () => {
            return addToast(
              {
                type: "pending",
                title: `${getFormattedTimeString()} Approving spend for ${
                  tokenFrom.name
                }`,
              },
              {
                autoDismiss: false, // TODO: be careful of orphan toasts on error
              },
            )
          },
          onTransactionSuccess: () => {
            return addToast({
              type: "success",
              title: `${getFormattedTimeString()} Successfully approved spend for ${
                tokenFrom.name
              }`,
            })
          },
          onTransactionError: () => {
            throw new Error("Your transaction could not be completed")
          },
        },
      )
      const clearMessage = addToast({
        type: "pending",
        title: `${getFormattedTimeString()} Starting your Swap...`,
      })
      let gasPrice
      if (gasPriceSelected === GasPrices.Custom) {
        gasPrice = gasCustom?.valueSafe
      } else if (gasPriceSelected === GasPrices.Fast) {
        gasPrice = gasFast
      } else if (gasPriceSelected === GasPrices.Instant) {
        gasPrice = gasInstant
      } else {
        gasPrice = gasStandard
      }
      gasPrice = parseUnits(String(gasPrice) || "45", 9)
      const txnArgs = { gasPrice }
      let swapTransaction
      if (state.swapType === SWAP_TYPES.TOKEN_TO_TOKEN) {
        const originPool = POOLS_MAP[state.from.poolName]
        const destinationPool = POOLS_MAP[state.to.poolName]
        const args = [
          [
            originPool.addresses[chainId],
            destinationPool.addresses[chainId],
          ] as [string, string],
          state.from.tokenIndex,
          state.to.tokenIndex,
          state.from.amount,
          subtractSlippage(
            state.to.amountMediumSynth,
            slippageSelected,
            slippageCustom,
          ), // subtract slippage from minSynth
          txnArgs,
        ] as const
        swapTransaction = await (state.bridgeContract as Bridge).tokenToToken(
          ...args,
        )
        console.debug("swap - tokenToToken", args)
      } else if (state.swapType === SWAP_TYPES.SYNTH_TO_TOKEN) {
        const destinationPool = POOLS_MAP[state.to.poolName]
        const args = [
          destinationPool.addresses[chainId],
          utils.formatBytes32String(state.from.symbol),
          state.to.tokenIndex,
          state.from.amount,
          subtractSlippage(
            state.to.amountMediumSynth,
            slippageSelected,
            slippageCustom,
          ), // subtract slippage from minSynth
          txnArgs,
        ] as const
        swapTransaction = await (state.bridgeContract as Bridge).synthToToken(
          ...args,
        )
        console.debug("swap - synthToToken", args)
      } else if (state.swapType === SWAP_TYPES.TOKEN_TO_SYNTH) {
        const destinationPool = POOLS_MAP[state.to.poolName]
        const args = [
          destinationPool.addresses[chainId],
          state.from.tokenIndex,
          utils.formatBytes32String(state.to.symbol),
          state.from.amount,
          subtractSlippage(state.to.amount, slippageSelected, slippageCustom),
          txnArgs,
        ] as const
        swapTransaction = await (state.bridgeContract as Bridge).tokenToSynth(
          ...args,
        )
        console.debug("swap - tokenToSynth", args)
      } else if (state.swapType === SWAP_TYPES.DIRECT) {
        const deadline = formatDeadlineToNumber(
          transactionDeadlineSelected,
          transactionDeadlineCustom,
        )
        const args = [
          state.from.tokenIndex,
          state.to.tokenIndex,
          state.from.amount,
          subtractSlippage(state.to.amount, slippageSelected, slippageCustom),
          Math.round(new Date().getTime() / 1000 + 60 * deadline),
          txnArgs,
        ] as const
        swapTransaction = await (state.swapContract as NonNullable<
          typeof state.swapContract // we already check for nonnull above
        >).swap(...args)
        console.debug("swap - direct", args)
      } else if (state.swapType === SWAP_TYPES.SYNTH_TO_SYNTH) {
        // TODO: support synth to synth
        throw new Error("Synth to Synth swaps not yet supported")
      } else {
        throw new Error("Invalid Swap Type, or contract not loaded")
      }
      await swapTransaction?.wait()
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.SWAP]: Date.now(),
        }),
      )
      clearMessage()
      addToast({
        type: "success",
        title: `${getFormattedTimeString()} Swap completed, giddyup! 🤠`,
      })
      return Promise.resolve()
    } catch (e) {
      console.error(e)
      clearToasts()
      addToast({
        type: "error",
        title: `${getFormattedTimeString()} Unable to complete your transaction`,
      })
    }
  }
}
