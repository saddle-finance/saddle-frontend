import {
  NumberInputState,
  numberInputStateCreator,
} from "../utils/numberInputState"
import { POOLS_MAP, POOL_FEE_PRECISION, PoolName } from "../constants"
import { useCallback, useMemo, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { applySlippage } from "../utils/slippage"
import { debounce } from "lodash"
import { parseUnits } from "@ethersproject/units"
import usePoolData from "../hooks/usePoolData"
import { useSelector } from "react-redux"
import { useSwapContract } from "../hooks/useContract"

interface ErrorState {
  field: string
  message: string
}
const MULTIPLE = "MULTIPLE"
export interface WithdrawFormState {
  percentage: string | null
  withdrawIn: string | null
  tokenInputs: NumberInputState[]
  error: ErrorState | null
}
type FormFields = Exclude<keyof WithdrawFormState, "error">
export type WithdrawFormAction = {
  fieldName: FormFields
  index?: number
  value: string
}

// Token input state handlers
export default function useWithdrawFormState(
  poolName: PoolName,
): [WithdrawFormState, (action: WithdrawFormAction) => void] {
  const POOL_TOKENS = POOLS_MAP[poolName]
  const swapContract = useSwapContract(poolName)
  const [, userShareData] = usePoolData(poolName)
  const { slippageCustom, slippageSelected } = useSelector(
    (state: AppState) => state.user,
  )
  const tokenInputStateCreators: {
    [tokenSymbol: string]: ReturnType<typeof numberInputStateCreator>
  } = useMemo(
    () =>
      POOL_TOKENS.reduce(
        (acc, token) => ({
          ...acc,
          [token.symbol]: numberInputStateCreator(
            token.decimals,
            BigNumber.from("0"),
          ),
        }),
        {},
      ),
    [POOL_TOKENS],
  )
  const [formState, setFormState] = useState<WithdrawFormState>({
    percentage: null,
    tokenInputs: POOL_TOKENS.map((token) =>
      tokenInputStateCreators[token.symbol]("0"),
    ),
    withdrawIn: MULTIPLE,
    error: null,
  })

  // TODO: resolve this, it's a little unsafe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateAndUpdateDynamicFields = useCallback(
    debounce(async (state: WithdrawFormState, action: WithdrawFormAction) => {
      if (userShareData == null || swapContract == null) return
      const { fieldName, value: inputValue } = action

      // Apply fees & slippage to userLPTokenBalance
      let userLPTokenBalance = userShareData.lpTokenBalance
      userLPTokenBalance = userLPTokenBalance
        .mul(
          BigNumber.from(10 ** POOL_FEE_PRECISION).sub(
            userShareData.currentWithdrawFee,
          ),
        )
        .div(10 ** POOL_FEE_PRECISION)
      userLPTokenBalance = applySlippage(
        userLPTokenBalance,
        slippageSelected,
        slippageCustom,
      )

      if (fieldName === "tokenInputs") {
        const { index: inputIndex } = action
        const newTokenInputValues = POOL_TOKENS.map((token, i) => {
          return i === inputIndex
            ? tokenInputStateCreators[token.symbol](inputValue || "0")
            : state.tokenInputs[i]
        })
        const tokenAmounts = newTokenInputValues.map((t) => t.valueSafe)

        let error: ErrorState | null = null
        try {
          const inputCalculatedLPTokenAmount = await swapContract.calculateTokenAmount(
            tokenAmounts,
            false,
          )
          if (inputCalculatedLPTokenAmount.gt(userLPTokenBalance)) {
            error = { field: "token", message: "Insufficient balance." }
          }
        } catch {
          // calculateTokenAmount errors if amount exceeds amount in pool
          error = { field: "token", message: "Insufficient balance in pool." }
        }
        setFormState((prevState) => ({
          ...prevState,
          error,
        }))
        return
      } else if (fieldName === "withdrawIn" || fieldName === "percentage") {
        // these fields are handled similarly so we group them together

        const withdrawIn =
          fieldName === "withdrawIn" ? inputValue : state.withdrawIn || MULTIPLE
        const percentageRaw =
          fieldName === "percentage" ? inputValue : state.percentage || "100"
        if (+percentageRaw < 0 || +percentageRaw > 100) {
          // Check if percent is out of bounds
          setFormState((prevState) => ({
            ...prevState,
            error: { field: "percentage", message: "Invalid input" },
            tokenInputs: POOL_TOKENS.map((token) =>
              tokenInputStateCreators[token.symbol]("0"),
            ),
          }))
          return
        }
        const percentagePrecision = 7
        const percentage = parseUnits(percentageRaw, percentagePrecision - 2)

        // LP * % to be withdrawn
        userLPTokenBalance = userLPTokenBalance
          .mul(percentage)
          .div(10 ** percentagePrecision)

        const tokenRoundingPrecision = 6
        let newTokenInputs: NumberInputState[]
        let error: ErrorState | null = null
        if (withdrawIn === MULTIPLE) {
          try {
            const tokenAmounts = await swapContract.calculateRemoveLiquidity(
              userLPTokenBalance,
            )
            newTokenInputs = POOL_TOKENS.map((token, i) => {
              return tokenInputStateCreators[token.symbol](
                tokenAmounts[i]
                  .div(10 ** (token.decimals - tokenRoundingPrecision)) // poor man's rounding
                  .mul(10 ** (token.decimals - tokenRoundingPrecision)),
              )
            })
          } catch {
            error = { field: "token", message: "Insufficient balance in pool." }
          }
        } else {
          try {
            const tokenIndex = POOL_TOKENS.findIndex(
              ({ symbol }) => symbol === withdrawIn,
            )
            let tokenAmount = await swapContract.calculateRemoveLiquidityOneToken(
              userLPTokenBalance,
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
            newTokenInputs = POOL_TOKENS.map((token, i) =>
              tokenInputStateCreators[token.symbol](
                i === tokenIndex ? tokenAmount : "0",
              ),
            )
          } catch {
            error = { field: "token", message: "Insufficient balance in pool." }
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
          const newTokenInputs = POOL_TOKENS.map((token, i) => {
            return i === action.index
              ? tokenInputStateCreators[token.symbol](action.value)
              : prevState.tokenInputs[i]
          })
          const hasMultiple =
            newTokenInputs.filter((t) => +t.valueRaw > 0).length > 1
          let withdrawIn = hasMultiple ? MULTIPLE : prevState.withdrawIn
          if (!hasMultiple) {
            withdrawIn =
              POOL_TOKENS.find((t, i) => +newTokenInputs[i].valueRaw > 0)
                ?.symbol || MULTIPLE // not found when all token inputs = 0
          }
          return {
            ...prevState,
            withdrawIn,
            percentage: null,
            tokenInputs: newTokenInputs,
          }
        })
      } else if (action.fieldName === "percentage") {
        setFormState((prevState) => ({
          ...prevState,
          withdrawIn: prevState.withdrawIn ? prevState.withdrawIn : MULTIPLE,
          percentage: action.value || "0",
        }))
      } else if (action.fieldName === "withdrawIn") {
        setFormState((prevState) => ({
          ...prevState,
          withdrawIn: action.value,
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
