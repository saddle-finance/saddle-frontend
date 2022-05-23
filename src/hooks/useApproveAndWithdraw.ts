import { addSlippage, subtractSlippage } from "../utils/slippage"
import { enqueuePromiseToast, enqueueToast } from "../components/Toastify"
import { formatUnits, parseUnits } from "@ethersproject/units"
import { useDispatch, useSelector } from "react-redux"
import { useLPTokenContract, useSwapContract } from "./useContract"

import { AppState } from "../state"
import { BasicPoolsContext } from "./../providers/BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import { GasPrices } from "../state/user"
import { NumberInputState } from "../utils/numberInputState"
import { TRANSACTION_TYPES } from "../constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { formatDeadlineToNumber } from "../utils"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useContext } from "react"

interface ApproveAndWithdrawStateArgument {
  tokenFormState?: { [address: string]: NumberInputState | undefined }
  withdrawType: string
  lpTokenAmountToSpend: BigNumber
}

export function useApproveAndWithdraw(
  poolName: string,
): (state?: ApproveAndWithdrawStateArgument) => Promise<void> {
  const dispatch = useDispatch()
  const basicPools = useContext(BasicPoolsContext)
  const swapContract = useSwapContract(poolName)
  const lpTokenContract = useLPTokenContract(poolName)
  const { account, chainId, library } = useActiveWeb3React()
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

  return async function approveAndWithdraw(
    state?: ApproveAndWithdrawStateArgument,
  ): Promise<void> {
    try {
      const basicPool = basicPools?.[poolName]
      if (!state) return
      if (!account || !chainId || !library)
        throw new Error("Wallet must be connected")
      if (!swapContract || !basicPool || !lpTokenContract)
        throw new Error("Swap contract is not loaded")
      if (state.lpTokenAmountToSpend.isZero()) return
      const withdrawTokens = basicPool.isMetaSwap
        ? basicPool.underlyingTokens
        : basicPool.tokens

      let gasPrice
      if (gasPriceSelected === GasPrices.Custom && gasCustom?.valueSafe) {
        gasPrice = gasCustom.valueSafe
      } else if (gasPriceSelected === GasPrices.Standard) {
        gasPrice = gasStandard
      } else if (gasPriceSelected === GasPrices.Instant) {
        gasPrice = gasInstant
      } else {
        gasPrice = gasFast
      }
      gasPrice = parseUnits(gasPrice?.toString() || "45", "gwei")
      const allowanceAmount =
        state.withdrawType === "IMBALANCE"
          ? addSlippage(
              state.lpTokenAmountToSpend,
              slippageSelected,
              slippageCustom,
            )
          : state.lpTokenAmountToSpend
      await checkAndApproveTokenForTrade(
        lpTokenContract,
        swapContract.address,
        account,
        allowanceAmount,
        infiniteApproval,
        gasPrice,
        {
          onTransactionError: () => {
            throw new Error("Your transaction could not be completed")
          },
        },
        chainId,
      )

      console.debug(
        `lpTokenAmountToSpend: ${formatUnits(state.lpTokenAmountToSpend, 18)}`,
      )
      const deadline = Math.round(
        new Date().getTime() / 1000 +
          60 *
            formatDeadlineToNumber(
              transactionDeadlineSelected,
              transactionDeadlineCustom,
            ),
      )
      let spendTransaction
      if (state.withdrawType === "ALL") {
        spendTransaction = await swapContract.removeLiquidity(
          state.lpTokenAmountToSpend,
          withdrawTokens.map((address) =>
            subtractSlippage(
              BigNumber.from(state.tokenFormState?.[address]?.valueSafe || "0"),
              slippageSelected,
              slippageCustom,
            ),
          ),
          deadline,
        )
      } else if (state.withdrawType === "IMBALANCE") {
        spendTransaction = await swapContract.removeLiquidityImbalance(
          withdrawTokens.map(
            (address) => state.tokenFormState?.[address]?.valueSafe || "0",
          ),
          addSlippage(
            state.lpTokenAmountToSpend,
            slippageSelected,
            slippageCustom,
          ),
          deadline,
        )
      } else {
        spendTransaction = await swapContract.removeLiquidityOneToken(
          state.lpTokenAmountToSpend,
          withdrawTokens.findIndex((address) => address === state.withdrawType), // @dev withdrawType is either token address or "reset"
          subtractSlippage(
            BigNumber.from(
              state.tokenFormState?.[state.withdrawType || ""]?.valueSafe ||
                "0",
            ),
            slippageSelected,
            slippageCustom,
          ),
          deadline,
        )
      }

      await enqueuePromiseToast(chainId, spendTransaction.wait(), "withdraw", {
        poolName,
      })
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.WITHDRAW]: Date.now(),
        }),
      )
    } catch (e) {
      console.error(e)
      enqueueToast(
        "error",
        e instanceof Error ? e.message : "Transaction Failed",
      )
    }
  }
}
