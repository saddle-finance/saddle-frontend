import {
  BTC_POOL_NAME,
  BTC_POOL_TOKENS,
  PoolName,
  STABLECOIN_POOL_NAME,
  STABLECOIN_POOL_TOKENS,
  TOKENS_MAP,
  TRANSACTION_TYPES,
  Token,
} from "../constants"
import { useAllContracts, useSwapContract } from "./useContract"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { GasPrices } from "../state/user"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { formatDeadlineToNumber } from "../utils"
import { getFormattedTimeString } from "../utils/dateTime"
import { parseUnits } from "@ethersproject/units"
import { subtractSlippage } from "../utils/slippage"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { useToast } from "./useToast"

interface ApproveAndSwapStateArgument {
  fromTokenSymbol: string
  toTokenSymbol: string
  fromAmount: BigNumber
  toAmount: BigNumber
}

export function useApproveAndSwap(
  poolName: PoolName,
): (state: ApproveAndSwapStateArgument) => Promise<void> {
  const dispatch = useDispatch()
  const swapContract = useSwapContract(poolName)
  const tokenContracts = useAllContracts()
  const { account } = useActiveWeb3React()
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
  let POOL_TOKENS: Token[]
  if (poolName === BTC_POOL_NAME) {
    POOL_TOKENS = BTC_POOL_TOKENS
  } else if (poolName === STABLECOIN_POOL_NAME) {
    POOL_TOKENS = STABLECOIN_POOL_TOKENS
  } else {
    throw new Error("useApproveAndSwap requires a valid pool name")
  }

  return async function approveAndSwap(
    state: ApproveAndSwapStateArgument,
  ): Promise<void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!swapContract) throw new Error("Swap contract is not loaded")

      // For each token being deposited, check the allowance and approve it if necessary
      const tokenContract = tokenContracts?.[state.fromTokenSymbol] as Erc20
      if (tokenContract == null) return
      const fromToken = TOKENS_MAP[state.fromTokenSymbol]
      await checkAndApproveTokenForTrade(
        tokenContract,
        swapContract.address,
        account,
        state.fromAmount,
        infiniteApproval,
        {
          onTransactionStart: () => {
            return addToast(
              {
                type: "pending",
                title: `${getFormattedTimeString()} Approving spend for ${
                  fromToken.name
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
                fromToken.name
              }`,
            })
          },
          onTransactionError: () => {
            throw new Error("Your transaction could not be completed")
          },
        },
      )

      let minToMint = state.toAmount
      console.debug(`MinToMint 1: ${minToMint.toString()}`)

      minToMint = subtractSlippage(minToMint, slippageSelected, slippageCustom)
      console.debug(`MinToMint 2: ${minToMint.toString()}`)
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
      const indexFrom = POOL_TOKENS.findIndex(
        ({ symbol }) => symbol === state.fromTokenSymbol,
      )
      const indexTo = POOL_TOKENS.findIndex(
        ({ symbol }) => symbol === state.toTokenSymbol,
      )
      const deadline = formatDeadlineToNumber(
        transactionDeadlineSelected,
        transactionDeadlineCustom,
      )
      const swapTransaction = await swapContract.swap(
        indexFrom,
        indexTo,
        state.fromAmount,
        minToMint,
        Math.round(new Date().getTime() / 1000 + 60 * deadline),
        {
          gasPrice,
        },
      )
      await swapTransaction.wait()
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
