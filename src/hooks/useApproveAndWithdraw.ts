import { POOLS_MAP, PoolName, TRANSACTION_TYPES } from "../constants"
import { addSlippage, subtractSlippage } from "../utils/slippage"
import { formatUnits, parseUnits } from "@ethersproject/units"
import { useLPTokenContract, useSwapContract } from "./useContract"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { GasPrices } from "../state/user"
import { NumberInputState } from "../utils/numberInputState"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { getFormattedTimeString } from "../utils/dateTime"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { useToast } from "./useToast"

interface ApproveAndWithdrawStateArgument {
  tokenFormState: { [symbol: string]: NumberInputState }
  infiniteApproval: boolean
  withdrawType: string
  lpTokenAmountToSpend: BigNumber
}

export function useApproveAndWithdraw(
  poolName: PoolName,
): (state: ApproveAndWithdrawStateArgument) => Promise<void> {
  const dispatch = useDispatch()
  const swapContract = useSwapContract(poolName)
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
  } = useSelector((state: AppState) => state.user)
  const lpTokenContract = useLPTokenContract(poolName)
  const POOL_TOKENS = POOLS_MAP[poolName]
  if (!POOL_TOKENS)
    throw new Error("useApproveAndWithdraw requires a valid pool name")

  return async function approveAndWithdraw(
    state: ApproveAndWithdrawStateArgument,
  ): Promise<void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!swapContract) throw new Error("Swap contract is not loaded")
      if (state.lpTokenAmountToSpend.isZero()) return
      if (lpTokenContract == null) return
      await checkAndApproveTokenForTrade(
        lpTokenContract,
        swapContract.address,
        account,
        addSlippage(
          BigNumber.from(state.lpTokenAmountToSpend),
          slippageSelected,
          slippageCustom,
        ),
        state.infiniteApproval,
        {
          onTransactionStart: () => {
            return addToast(
              {
                type: "pending",
                title: `${getFormattedTimeString()} Approving spend for lpToken`,
              },
              {
                autoDismiss: false, // TODO: be careful of orphan toasts on error
              },
            )
          },
          onTransactionSuccess: () => {
            return addToast({
              type: "success",
              title: `${getFormattedTimeString()} Successfully approved spend for lpToken`,
            })
          },
          onTransactionError: () => {
            throw new Error("Your transaction could not be completed")
          },
        },
      )

      const clearMessage = addToast({
        type: "pending",
        title: `${getFormattedTimeString()} Starting your withdraw...`,
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
      gasPrice = parseUnits(gasPrice?.toString() || "25", "gwei")
      console.debug(
        `lpTokenAmountToSpend: ${formatUnits(state.lpTokenAmountToSpend, 18)}`,
      )
      let spendTransaction
      if (state.withdrawType === "ALL") {
        spendTransaction = await swapContract.removeLiquidity(
          state.lpTokenAmountToSpend,
          POOL_TOKENS.map(({ symbol }) =>
            subtractSlippage(
              BigNumber.from(state.tokenFormState[symbol].valueSafe),
              slippageSelected,
              slippageCustom,
            ),
          ),
          Math.round(new Date().getTime() / 1000 + 60 * 10),
          {
            gasPrice,
          },
        )
      } else if (state.withdrawType === "IMBALANCE") {
        // TODO: check math
        spendTransaction = await swapContract.removeLiquidityImbalance(
          POOL_TOKENS.map(
            ({ symbol }) => state.tokenFormState[symbol].valueSafe,
          ),
          addSlippage(
            BigNumber.from(state.lpTokenAmountToSpend),
            slippageSelected,
            slippageCustom,
          ),
          Math.round(new Date().getTime() / 1000 + 60 * 10),
          {
            gasPrice,
          },
        )
      } else {
        // state.withdrawType === [TokenSymbol]
        spendTransaction = await swapContract.removeLiquidityOneToken(
          state.lpTokenAmountToSpend,
          POOL_TOKENS.findIndex(({ symbol }) => symbol === state.withdrawType),
          subtractSlippage(
            BigNumber.from(
              state.tokenFormState[state.withdrawType || ""].valueSafe,
            ),
            slippageSelected,
            slippageCustom,
          ),
          Math.round(new Date().getTime() / 1000 + 60 * 10),
          {
            gasPrice,
          },
        )
      }

      await spendTransaction.wait()
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.WITHDRAW]: Date.now(),
        }),
      )
      clearMessage()
      addToast({
        type: "success",
        title: `${getFormattedTimeString()} Liquidity withdrawn`,
      })
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
