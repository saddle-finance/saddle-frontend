import { BasicToken, TokensContext } from "../providers/TokensProvider"
import { addSlippage, subtractSlippage } from "../utils/slippage"
import { enqueuePromiseToast, enqueueToast } from "../components/Toastify"
import { formatUnits, parseUnits } from "@ethersproject/units"
import { useContext, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLPTokenContract, useSwapContract } from "./useContract"

import { AppState } from "../state"
import { BasicPoolsContext } from "./../providers/BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { GasPrices } from "../state/user"
import { IS_PRODUCTION } from "../utils/environment"
import META_SWAP_ABI from "../constants/abis/metaSwap.json"
import { MetaSwap } from "../../types/ethers-contracts/MetaSwap"
import { NumberInputState } from "../utils/numberInputState"
import { TRANSACTION_TYPES } from "../constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { formatDeadlineToNumber } from "../utils"
import { getContract } from "../utils"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."

interface ApproveAndWithdrawStateArgument {
  tokenFormState?: { [address: string]: NumberInputState | undefined }
  withdrawType: string
  lpTokenAmountToSpend: BigNumber
}

export function useApproveAndWithdraw(
  poolName: string,
): (
  state?: ApproveAndWithdrawStateArgument,
  shouldWithdrawWrapped?: boolean,
) => Promise<void> {
  const dispatch = useDispatch()
  const basicPools = useContext(BasicPoolsContext)
  const swapContract = useSwapContract(poolName)
  const lpTokenContract = useLPTokenContract(poolName)
  const { account, chainId, library } = useActiveWeb3React()
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const tokens = useContext(TokensContext)
  const pool = basicPools?.[poolName]

  const metaSwapContract = useMemo(() => {
    if (pool?.poolAddress && chainId && library) {
      return getContract(
        pool.poolAddress,
        META_SWAP_ABI,
        library,
        account ?? undefined,
      )
    }
  }, [chainId, library, account, pool?.poolAddress])

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
    shouldWithdrawWrapped?: boolean,
  ): Promise<void> {
    try {
      const basicPool = basicPools?.[poolName]
      if (!state || !tokens) return
      if (!account || !chainId || !library)
        throw new Error("Wallet must be connected")
      if (!swapContract || !basicPool || !lpTokenContract)
        throw new Error("Swap contract is not loaded")
      if (state.lpTokenAmountToSpend.isZero()) return

      const withdrawTokens = // When pool is MetaSwap pool, it includes LP token and other token ex: ["wCUSD","saddleUSD-V2"]
        !basicPool.isMetaSwap || shouldWithdrawWrapped
          ? basicPool.tokens
          : basicPool.underlyingTokens // If pool is not MetaSwap pool, this value is empty

      if (!withdrawTokens) return

      const poolTokens = withdrawTokens.map((token) => tokens[token])

      const effectiveSwapContract = shouldWithdrawWrapped
        ? (metaSwapContract as MetaSwap)
        : swapContract

      let rawGasPrice: string | number | undefined
      if (gasPriceSelected === GasPrices.Custom && gasCustom?.valueSafe) {
        rawGasPrice = gasCustom.valueSafe
      } else if (gasPriceSelected === GasPrices.Standard) {
        rawGasPrice = gasStandard
      } else if (gasPriceSelected === GasPrices.Instant) {
        rawGasPrice = gasInstant
      } else {
        rawGasPrice = gasFast
      }
      const gasPrice = parseUnits(rawGasPrice?.toString() || "45", "gwei")

      const allowanceAmount =
        state.withdrawType === "IMBALANCE"
          ? addSlippage(
              state.lpTokenAmountToSpend,
              slippageSelected,
              slippageCustom,
            )
          : state.lpTokenAmountToSpend

      const approveSingleToken = async (
        token: BasicToken | undefined,
      ): Promise<void> => {
        if (!token || !library) {
          enqueueToast(
            "error",
            "There was a problem loading the token or library",
          )
          console.error("Token or library is not loaded")
          return
        }
        const spendingValue = BigNumber.from(
          state.tokenFormState?.[token.address]?.valueSafe ?? "0",
        )
        if (spendingValue.isZero()) return
        const tokenContract = getContract(
          token.address,
          ERC20_ABI,
          library,
          account ?? undefined,
        ) as Erc20
        if (tokenContract == null) return
        await checkAndApproveTokenForTrade(
          lpTokenContract,
          effectiveSwapContract.address,
          account,
          spendingValue,
          infiniteApproval,
          gasPrice,
          {
            onTransactionError: () => {
              throw new Error("Your transaction could not be completed")
            },
          },
          chainId,
        )
        return
      }

      if (state.withdrawType === "ALL") {
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
      } else if (state.withdrawType === "IMBALANCE") {
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
      } else {
        if (!IS_PRODUCTION) {
          for (const token of poolTokens) {
            await approveSingleToken(token)
          }
        } else {
          await Promise.all(
            poolTokens.map((token) => approveSingleToken(token)),
          )
        }
      }
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
        spendTransaction = await effectiveSwapContract.removeLiquidity(
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
        spendTransaction = await effectiveSwapContract.removeLiquidityImbalance(
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
        const tokenIndexToRemove = withdrawTokens.findIndex(
          (address) => address === state.withdrawType,
        )

        if (!state.tokenFormState || !state.withdrawType) return
        const lpTokenAmountToRemoveOneToken =
          state.tokenFormState[state.withdrawType]?.valueSafe

        if (lpTokenAmountToRemoveOneToken) {
          spendTransaction =
            await effectiveSwapContract.removeLiquidityOneToken(
              lpTokenAmountToRemoveOneToken,
              tokenIndexToRemove,
              subtractSlippage(
                BigNumber.from(lpTokenAmountToRemoveOneToken || "0"),
                slippageSelected,
                slippageCustom,
              ),
              deadline,
            )
        } else {
          return
        }
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
