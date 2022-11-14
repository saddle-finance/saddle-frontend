import {
  NumberInputState,
  numberInputStateCreator,
} from "../utils/numberInputState"
import { useCallback, useEffect, useMemo, useState } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import META_SWAP_ABI from "../constants/abis/metaSwap.json"
import { MetaSwap } from "../../types/ethers-contracts/MetaSwap"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { SwapFlashLoanNoWithdrawFee } from "../../types/ethers-contracts/SwapFlashLoanNoWithdrawFee"
import { Zero } from "@ethersproject/constants"
import { debounce } from "lodash"
import { getContract } from "../utils"
import { isWithdrawFeePool } from "../constants"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "."
import usePoolData from "../hooks/usePoolData"
import { useSwapContract } from "../hooks/useContract"

interface ErrorState {
  field: string
  message: string
}
const IMBALANCE = "IMBALANCE"
const ALL = "ALL"

interface TokenInputs {
  [address: string]: NumberInputState | undefined
}
export interface WithdrawFormState {
  percentage: string | null
  withdrawType: "IMBALANCE" | "ALL" | ""
  tokenInputs: TokenInputs
  lpTokenAmountToSpend: BigNumber
  error: ErrorState | null
}
type FormFields = Exclude<keyof WithdrawFormState, "error">
export type WithdrawFormAction = {
  fieldName: FormFields | "reset"
  address?: string
  value: string
}

export default function useWithdrawFormState(poolName: string) {
  const swapContract = useSwapContract(poolName)
  const [poolData, userShareData] = usePoolData(poolName)
  const [shouldWithdrawWrapped, setShouldWithdrawWrapped] = useState(false)
  const [formState, setFormState] = useState<WithdrawFormState>({
    error: null,
    lpTokenAmountToSpend: BigNumber.from("0"),
    percentage: "",
    tokenInputs: {},
    withdrawType: "",
  })
  const { account, library } = useActiveWeb3React()

  const metaSwapContract = useMemo(() => {
    if (poolData?.poolAddress && library) {
      return getContract(
        poolData.poolAddress,
        META_SWAP_ABI,
        library,
        account ?? undefined,
      ) as MetaSwap
    }
    return null
  }, [library, account, poolData?.poolAddress])

  // When pool is MetaSwap pool, it includes LP token and other token ex: ["wCUSD","saddleUSD-V2"]
  const withdrawTokens =
    !poolData.isMetaSwap || shouldWithdrawWrapped
      ? userShareData.tokens
      : userShareData.underlyingTokens // If pool is not MetaSwap pool, this value is empty

  const tokenInputStateCreators: {
    [address: string]: ReturnType<typeof numberInputStateCreator>
  } = useMemo(
    () =>
      withdrawTokens?.reduce(
        (acc, { address, decimals }) => ({
          ...acc,
          [address]: numberInputStateCreator(decimals, BigNumber.from("0")),
        }),
        {},
      ),
    [withdrawTokens],
  )
  const tokenInputsEmptyState = useMemo(
    () =>
      withdrawTokens.reduce(
        (acc, { address }) => ({
          ...acc,
          [address]: tokenInputStateCreators[address](),
        }),
        {},
      ),
    [withdrawTokens, tokenInputStateCreators],
  )
  const formEmptyState = useMemo(
    () =>
      ({
        percentage: "",
        tokenInputs: tokenInputsEmptyState,
        withdrawType: "",
        error: null,
        lpTokenAmountToSpend: BigNumber.from("0"),
      } as WithdrawFormState),
    [tokenInputsEmptyState],
  )

  useEffect(() => {
    setFormState(formEmptyState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(formEmptyState)]) // TODO: improve this logic later

  // TODO: resolve this, it's a little unsafe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateAndUpdateDynamicFields = useCallback(
    debounce(async (state: WithdrawFormState) => {
      if (userShareData == null || swapContract == null || account == null)
        return

      let percentageRaw
      if (state.percentage === "") {
        percentageRaw = "0"
      } else if (state.percentage === null) {
        percentageRaw = "100"
      } else {
        percentageRaw = state.percentage
      }

      // LP * % to be withdrawn
      const effectiveUserLPTokenBalance = userShareData.lpTokenBalance
        .mul(parseUnits(percentageRaw, 5)) // difference between numerator and denominator because we're going from 100 to 1.00
        .div(10 ** 7)

      // Use state.withdrawType to figure out which swap functions to use to calcuate next state
      let nextState: WithdrawFormState | Record<string, unknown>
      if (state.withdrawType === IMBALANCE) {
        try {
          let inputCalculatedLPTokenAmount: BigNumber
          if (isWithdrawFeePool(poolData.name)) {
            inputCalculatedLPTokenAmount = await (
              swapContract as SwapFlashLoan
            ).calculateTokenAmount(
              account,
              withdrawTokens.map(
                ({ address }) => state.tokenInputs[address]?.valueSafe || Zero,
              ),
              false,
            )
          } else {
            inputCalculatedLPTokenAmount = await (
              swapContract as SwapFlashLoanNoWithdrawFee
            ).calculateTokenAmount(
              withdrawTokens.map(
                ({ address }) => state.tokenInputs[address]?.valueSafe || Zero,
              ),
              false,
            )
          }
          nextState = inputCalculatedLPTokenAmount.gt(
            effectiveUserLPTokenBalance,
          )
            ? {
                error: {
                  field: "tokenInputs",
                  message: "Insufficient balance.",
                },
                lpTokenAmountToSpend: BigNumber.from("0"),
              }
            : {
                error: null,
                lpTokenAmountToSpend: inputCalculatedLPTokenAmount,
              }
        } catch (e) {
          console.error(e)
          // calculateTokenAmount errors if amount exceeds amount in pool
          nextState = {
            error: {
              field: "tokenInputs",
              message: "Insufficient balance in pool.",
            },
            lpTokenAmountToSpend: BigNumber.from("0"),
          }
        }
      } else if (state.withdrawType === ALL) {
        try {
          let tokenAmounts: BigNumber[]
          if (isWithdrawFeePool(poolName)) {
            tokenAmounts = await (
              swapContract as SwapFlashLoan
            ).calculateRemoveLiquidity(account, effectiveUserLPTokenBalance)
          } else {
            tokenAmounts = await (
              swapContract as SwapFlashLoanNoWithdrawFee
            ).calculateRemoveLiquidity(effectiveUserLPTokenBalance)
          }
          nextState = {
            lpTokenAmountToSpend: effectiveUserLPTokenBalance,
            tokenInputs: withdrawTokens.reduce(
              (acc, { address }, i) => ({
                ...acc,
                [address]: tokenInputStateCreators[address](tokenAmounts[i]),
              }),
              {},
            ),
            error: null,
          }
        } catch {
          nextState = {
            error: {
              field: "tokenInputs",
              message: "Insufficient balance in pool.",
            },
          }
        }
      } else {
        try {
          if (state.percentage) {
            const tokenIndex = withdrawTokens.findIndex(
              ({ address }) => address === state.withdrawType,
            )

            let tokenAmount: BigNumber
            const withdrawAmount = withdrawTokens[tokenIndex].value
              .mul(parseUnits(percentageRaw, 5)) // difference between numerator and denominator because we're going from 100 to 1.00
              .div(10 ** 7)

            if (poolData.isMetaSwap) {
              if (shouldWithdrawWrapped) {
                tokenAmount = await (
                  metaSwapContract as MetaSwap
                ).calculateRemoveLiquidityOneToken(withdrawAmount, tokenIndex) // calculate withdraw-able token amount using MetaSwap's calculateRemoveLiquidityOneToken()
              } else {
                tokenAmount = await (
                  swapContract as SwapFlashLoanNoWithdrawFee
                ).calculateRemoveLiquidityOneToken(withdrawAmount, tokenIndex) // calculate withdraw-able token amount using MetaSwapDeposit's calculateRemoveLiquidityOneToken()
              }
            } else {
              if (isWithdrawFeePool(poolName)) {
                tokenAmount = await (
                  swapContract as SwapFlashLoan
                ).calculateRemoveLiquidityOneToken(
                  account,
                  withdrawAmount,
                  tokenIndex,
                ) // actual coin amount to be returned
              } else {
                tokenAmount = await (
                  swapContract as SwapFlashLoanNoWithdrawFee
                ).calculateRemoveLiquidityOneToken(withdrawAmount, tokenIndex) //calculate withdraw-able token amount using Swap's calculateRemoveLiquidityOneToken()
              }
            }
            nextState = {
              lpTokenAmountToSpend: effectiveUserLPTokenBalance,
              tokenInputs: withdrawTokens.reduce(
                (acc, { address }, i) => ({
                  ...acc,
                  [address]: tokenInputStateCreators[address](
                    i === tokenIndex ? tokenAmount : "",
                  ),
                }),
                {},
              ),
              error: null,
            }
          } else {
            // This branch addresses a user manually inputting a value for one token
            let inputCalculatedLPTokenAmount: BigNumber
            if (isWithdrawFeePool(poolData.name)) {
              inputCalculatedLPTokenAmount = await (
                swapContract as SwapFlashLoan
              ).calculateTokenAmount(
                account,
                withdrawTokens.map(
                  ({ address }) =>
                    state.tokenInputs[address]?.valueSafe || Zero,
                ),
                false,
              )
            } else {
              inputCalculatedLPTokenAmount = await (
                swapContract as SwapFlashLoanNoWithdrawFee
              ).calculateTokenAmount(
                withdrawTokens.map(
                  ({ address }) =>
                    state.tokenInputs[address]?.valueSafe || Zero,
                ),
                false,
              )
            }
            nextState = inputCalculatedLPTokenAmount.gt(
              effectiveUserLPTokenBalance,
            )
              ? {
                  error: {
                    field: "tokenInputs",
                    message: "Insufficient balance.",
                  },
                  lpTokenAmountToSpend: BigNumber.from("0"),
                }
              : {
                  lpTokenAmountToSpend: inputCalculatedLPTokenAmount,
                  error: null,
                }
          }
        } catch (error) {
          nextState = {
            error: {
              field: "tokenInputs",
              message: "Insufficient balance in pool.",
            },
          }
          console.error("error on withdraw form", error)
        }
      }
      setFormState((prevState) => ({
        ...prevState,
        ...nextState,
      }))
    }, 250),
    [userShareData, swapContract, withdrawTokens, tokenInputStateCreators],
  )

  const handleUpdateForm = useCallback(
    (action: WithdrawFormAction): void => {
      // update the form with user input immediately
      // then call expensive debounced fn to update other fields
      setFormState((prevState) => {
        let nextState: WithdrawFormState | Record<string, unknown> = {}
        if (action.fieldName === "tokenInputs") {
          const { address = "", value: valueInput } = action
          const newTokenInputs = {
            ...prevState.tokenInputs,
            [address]: tokenInputStateCreators[address](valueInput),
          }
          const activeInputTokens = withdrawTokens.filter(
            ({ address }) => +(newTokenInputs[address]?.valueRaw || "0") !== 0,
          )
          let withdrawType
          if (activeInputTokens.length === 0) {
            withdrawType = ALL
          } else if (activeInputTokens.length === 1) {
            withdrawType = activeInputTokens[0].address
          } else {
            withdrawType = IMBALANCE
          }
          nextState = {
            withdrawType,
            lpTokenAmountToSpend: BigNumber.from("0"),
            percentage: null,
            tokenInputs: newTokenInputs,
            error: null,
          }
        } else if (action.fieldName === "percentage") {
          const isInputInvalid =
            isNaN(+action.value) || +action.value < 0 || +action.value > 100
          nextState = isInputInvalid
            ? {
                percentage: action.value,
                lpTokenAmountToSpend: BigNumber.from("0"),
                error: { field: "percentage", message: "Invalid input" },
                tokenInputs: tokenInputsEmptyState,
              }
            : {
                withdrawType:
                  prevState.withdrawType === IMBALANCE
                    ? ALL
                    : prevState.withdrawType,
                percentage: action.value,
                error: null,
              }
        } else if (action.fieldName === "withdrawType") {
          nextState = {
            tokenInputs: tokenInputsEmptyState,
            percentage: prevState.percentage || "100",
            withdrawType: action.value,
            error: null,
          }
        } else if (action.fieldName === "reset") {
          nextState = formEmptyState
        }
        const finalState = {
          ...prevState,
          ...nextState,
        }
        const pendingTokenInput =
          action.fieldName === "tokenInputs" &&
          withdrawTokens.every(({ address }) => {
            const stateValue = finalState.tokenInputs[address]?.valueRaw || Zero
            return isNaN(+stateValue) || +stateValue === 0
          })
        if (!finalState.error && !pendingTokenInput) {
          void calculateAndUpdateDynamicFields(finalState)
        }
        return finalState
      })
    },
    [
      withdrawTokens,
      calculateAndUpdateDynamicFields,
      tokenInputStateCreators,
      tokenInputsEmptyState,
      formEmptyState,
    ],
  )

  return {
    formState,
    handleUpdateForm,
    withdrawTokens,
    shouldWithdrawWrapped,
    setShouldWithdrawWrapped,
  }
}
