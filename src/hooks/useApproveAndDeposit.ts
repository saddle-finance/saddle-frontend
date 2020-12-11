import { GasPrices, Slippages } from "../state/user"
import { POOLS_MAP, PoolName, TRANSACTION_TYPES } from "../constants"
import { useAllContracts, useSwapContract } from "./useContract"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { NumberInputState } from "../utils/numberInputState"
import { applySlippage } from "../utils/slippage"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { getFormattedTimeString } from "../utils/dateTime"
import { parseUnits } from "@ethersproject/units"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { useToast } from "./useToast"

interface ApproveAndDepositStateArgument {
  tokenFormState: { [tokenSymbol: string]: NumberInputState }
  infiniteApproval: boolean
  slippageSelected: Slippages
  slippageCustom?: NumberInputState
  gasPriceSelected: GasPrices
  gasCustom?: NumberInputState
}

export function useApproveAndDeposit(
  poolName: PoolName,
): (state: ApproveAndDepositStateArgument) => Promise<void> {
  const dispatch = useDispatch()
  const swapContract = useSwapContract(poolName)
  const tokenContracts = useAllContracts()
  const { account } = useActiveWeb3React()
  const { addToast, clearToasts } = useToast()
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )

  const POOL_TOKENS = POOLS_MAP[poolName]
  if (!POOL_TOKENS)
    throw new Error("useApproveAndDeposit requires a valid pool name")

  return async function approveAndDeposit(
    state: ApproveAndDepositStateArgument,
  ): Promise<void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!swapContract) throw new Error("Swap contract is not loaded")
      // For each token being desposited, check the allowance and approve it if necessary
      for (const token of POOL_TOKENS) {
        const spendingValue = BigNumber.from(
          state.tokenFormState[token.symbol].valueSafe,
        )
        if (spendingValue.isZero()) continue
        const tokenContract = tokenContracts?.[token.symbol]
        if (tokenContract == null) continue
        await checkAndApproveTokenForTrade(
          tokenContract,
          swapContract.address,
          account,
          spendingValue,
          state.infiniteApproval,
          {
            onTransactionStart: () => {
              return addToast(
                {
                  type: "pending",
                  title: `${getFormattedTimeString()} Approving spend for ${
                    token.name
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
                  token.name
                }`,
              })
            },
            onTransactionError: () => {
              throw new Error("Your transaction could not be completed")
            },
          },
        )
      }
      // "isFirstTransaction" check can be removed after launch
      const poolTokenBalances: BigNumber[] = await Promise.all(
        POOL_TOKENS.map(async (token, i) => {
          return await swapContract.getTokenBalance(i)
        }),
      )
      const isFirstTransaction = poolTokenBalances.every((bal) => bal.isZero())
      let minToMint: BigNumber
      if (isFirstTransaction) {
        minToMint = BigNumber.from("0")
      } else {
        minToMint = await swapContract.calculateTokenAmount(
          POOL_TOKENS.map(
            ({ symbol }) => state.tokenFormState[symbol].valueSafe,
          ),
          true, // deposit boolean
        )
      }
      console.debug(`MinToMint 1: ${minToMint.toString()}`)

      minToMint = applySlippage(
        minToMint,
        state.slippageSelected,
        state.slippageCustom,
      )
      console.debug(`MinToMint 2: ${minToMint.toString()}`)
      const clearMessage = addToast({
        type: "pending",
        title: `${getFormattedTimeString()} Starting your deposit...`,
      })
      let gasPrice
      if (state.gasPriceSelected === GasPrices.Custom) {
        gasPrice = state.gasCustom?.valueSafe
      } else if (state.gasPriceSelected === GasPrices.Fast) {
        gasPrice = gasFast
      } else if (state.gasPriceSelected === GasPrices.Instant) {
        gasPrice = gasInstant
      } else {
        gasPrice = gasStandard
      }
      gasPrice = parseUnits(String(gasPrice) || "45", 9)
      const spendTransaction = await swapContract.addLiquidity(
        POOL_TOKENS.map(({ symbol }) => state.tokenFormState[symbol].valueSafe),
        minToMint,
        Math.round(new Date().getTime() / 1000 + 60 * 10),
        {
          gasPrice,
        },
      )
      await spendTransaction.wait()
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.DEPOSIT]: Date.now(),
        }),
      )
      clearMessage()
      addToast({
        type: "success",
        title: `${getFormattedTimeString()} Liquidity added, giddyup! 🤠`,
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
