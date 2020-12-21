import {
  NumberInputState,
  numberInputStateCreator,
} from "../utils/numberInputState"
import { POOLS_MAP, POOL_FEE_PRECISION, PoolName } from "../constants"
import { useCallback, useMemo, useState } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import { debounce } from "lodash"
import { parseUnits } from "@ethersproject/units"
import usePoolData from "../hooks/usePoolData"
import { useSwapContract } from "../hooks/useContract"

interface ErrorState {
  field: string
  message: string
}
const IMBALANCE = "IMBALANCE"
const ALL = "ALL"

interface TokenInputs {
  [symbol: string]: NumberInputState
}
export interface WithdrawFormState {
  percentage: string | null
  withdrawType: string
  tokenInputs: TokenInputs
  error: ErrorState | null
}
type FormFields = Exclude<keyof WithdrawFormState, "error">
export type WithdrawFormAction = {
  fieldName: FormFields
  tokenSymbol?: string
  value: string
}

// Token input state handlers
export default function useWithdrawFormState(
  poolName: PoolName,
): [WithdrawFormState, (action: WithdrawFormAction) => void] {
  const POOL_TOKENS = POOLS_MAP[poolName]
  const swapContract = useSwapContract(poolName)
  const [, userShareData] = usePoolData(poolName)
  const tokenInputStateCreators: {
    [tokenSymbol: string]: ReturnType<typeof numberInputStateCreator>
  } = useMemo(
    () =>
      POOL_TOKENS.reduce(
        (acc, { symbol, decimals }) => ({
          ...acc,
          [symbol]: numberInputStateCreator(decimals, BigNumber.from("0")),
        }),
        {},
      ),
    [POOL_TOKENS],
  )
  const tokenInputsEmptyState = useMemo(
    () =>
      POOL_TOKENS.reduce(
        (acc, { symbol }) => ({
          ...acc,
          [symbol]: tokenInputStateCreators[symbol]("0"),
        }),
        {},
      ),
    [POOL_TOKENS, tokenInputStateCreators],
  )
  const [formState, setFormState] = useState<WithdrawFormState>({
    percentage: null,
    tokenInputs: tokenInputsEmptyState,
    withdrawType: ALL,
    error: null,
  })

  // TODO: resolve this, it's a little unsafe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateAndUpdateDynamicFields = useCallback(
    debounce(async (state: WithdrawFormState, action: WithdrawFormAction) => {
      if (userShareData == null || swapContract == null) return
      const { fieldName, value: inputValue } = action

      // Apply fees to userLPTokenBalance

      let effectiveUserLPTokenBalance = userShareData.lpTokenBalance
        .mul(
          BigNumber.from(10 ** POOL_FEE_PRECISION).sub(
            userShareData.currentWithdrawFee,
          ),
        )
        .div(10 ** POOL_FEE_PRECISION)

      if (fieldName === "tokenInputs") {
        const { tokenSymbol: inputTokenSymbol } = action
        const newTokenInputValues: TokenInputs = POOL_TOKENS.reduce(
          (acc, { symbol }) => ({
            ...acc,
            [symbol]:
              symbol === inputTokenSymbol
                ? tokenInputStateCreators[symbol](inputValue || "0")
                : state.tokenInputs[symbol],
          }),
          {},
        )

        let error: ErrorState | null = null
        try {
          const tokenAmounts = POOL_TOKENS.map(
            ({ symbol }) => newTokenInputValues[symbol].valueSafe,
          )
          const inputCalculatedLPTokenAmount = await swapContract.calculateTokenAmount(
            tokenAmounts,
            false,
          )
          if (inputCalculatedLPTokenAmount.gt(effectiveUserLPTokenBalance)) {
            error = { field: "tokenInputs", message: "Insufficient balance." }
          }
        } catch {
          // calculateTokenAmount errors if amount exceeds amount in pool
          error = {
            field: "tokenInputs",
            message: "Insufficient balance in pool.",
          }
        }
        setFormState((prevState) => ({
          ...prevState,
          error,
        }))
        return
      } else if (fieldName === "withdrawType" || fieldName === "percentage") {
        // these fields are handled similarly so we group them together

        const withdrawType =
          fieldName === "withdrawType" ? inputValue : state.withdrawType
        const percentageRaw =
          fieldName === "percentage" ? inputValue : state.percentage || "100"
        if (
          isNaN(+percentageRaw) ||
          +percentageRaw < 0 ||
          +percentageRaw > 100
        ) {
          // Check if percent is out of bounds
          setFormState((prevState) => ({
            ...prevState,
            error: { field: "percentage", message: "Invalid input" },
            tokenInputs: tokenInputsEmptyState,
          }))
          return
        }
        const percentagePrecision = 7
        const percentage = parseUnits(percentageRaw, percentagePrecision - 2)

        // LP * % to be withdrawn
        effectiveUserLPTokenBalance = effectiveUserLPTokenBalance
          .mul(percentage)
          .div(10 ** percentagePrecision)

        const tokenRoundingPrecision = 6
        let newTokenInputs: TokenInputs
        let error: ErrorState | null = null

        if (withdrawType === ALL || withdrawType === IMBALANCE) {
          try {
            const tokenAmounts = await swapContract.calculateRemoveLiquidity(
              effectiveUserLPTokenBalance,
            )
            newTokenInputs = POOL_TOKENS.reduce(
              (acc, { symbol, decimals }, i) => ({
                ...acc,
                [symbol]: tokenInputStateCreators[symbol](
                  tokenAmounts[i]
                    .div(10 ** (decimals - tokenRoundingPrecision)) // poor man's rounding
                    .mul(10 ** (decimals - tokenRoundingPrecision)),
                ),
              }),
              {},
            )
          } catch {
            error = {
              field: "tokenInputs",
              message: "Insufficient balance in pool.",
            }
          }
        } else {
          // Handles case where WithdrawType is a single token
          try {
            const tokenIndex = POOL_TOKENS.findIndex(
              ({ symbol }) => symbol === withdrawType,
            )

            let tokenAmount = await swapContract.calculateRemoveLiquidityOneToken(
              effectiveUserLPTokenBalance,
              tokenIndex,
            )
            tokenAmount = tokenAmount
              .div(
                10 **
                  (POOL_TOKENS[tokenIndex].decimals - tokenRoundingPrecision),
              ) // poor man's rounding
              .mul(
                10 **
                  (POOL_TOKENS[tokenIndex].decimals - tokenRoundingPrecision),
              )
            newTokenInputs = POOL_TOKENS.reduce(
              (acc, { symbol }, i) => ({
                ...acc,
                [symbol]: tokenInputStateCreators[symbol](
                  i === tokenIndex ? tokenAmount : "0",
                ),
              }),
              {},
            )
          } catch {
            error = {
              field: "tokenInputs",
              message: "Insufficient balance in pool.",
            }
          }
        }
        setFormState((prevState) => ({
          ...prevState,
          error: error,
          percentage: percentageRaw,
          tokenInputs: newTokenInputs || prevState.tokenInputs,
        }))
      }
    }, 250),
    [userShareData, swapContract, POOL_TOKENS, tokenInputStateCreators],
  )

  const handleUpdateForm = useCallback(
    (action: WithdrawFormAction): void => {
      // update the form with user input immediately
      // then call expensive debounced fn to update other fields
      if (action.fieldName === "tokenInputs") {
        setFormState((prevState) => {
          const { tokenSymbol: tokenSymbolInput, value: valueInput } = action
          const newTokenInputs: TokenInputs = POOL_TOKENS.reduce(
            (acc, { symbol }) => ({
              ...acc,
              [symbol]:
                symbol === tokenSymbolInput
                  ? tokenInputStateCreators[symbol](valueInput)
                  : prevState.tokenInputs[symbol],
            }),
            {},
          )
          const hasMultiple =
            POOL_TOKENS.filter(
              ({ symbol }) => +newTokenInputs[symbol].valueRaw > 0,
            ).length > 1
          let withdrawType = hasMultiple ? IMBALANCE : prevState.withdrawType
          if (!hasMultiple) {
            withdrawType =
              POOL_TOKENS.find(
                ({ symbol }) => +newTokenInputs[symbol].valueRaw > 0,
              )?.symbol || ALL // not found when all token inputs = 0
          }
          return {
            ...prevState,
            withdrawType,
            percentage: null,
            tokenInputs: newTokenInputs,
          }
        })
      } else if (action.fieldName === "percentage") {
        setFormState((prevState) => ({
          ...prevState,
          withdrawType:
            prevState.withdrawType === IMBALANCE ? ALL : prevState.withdrawType,
          percentage: action.value || "0",
        }))
      } else if (action.fieldName === "withdrawType") {
        setFormState((prevState) => ({
          ...prevState,
          withdrawType: action.value,
        }))
      }
      calculateAndUpdateDynamicFields(formState, action)
    },
    [
      POOL_TOKENS,
      calculateAndUpdateDynamicFields,
      tokenInputStateCreators,
      formState,
    ],
  )

  return [formState, handleUpdateForm]
}
