import { POOLS_MAP, PoolName, TOKENS_MAP } from "../constants"
import React, { ReactElement, useCallback, useMemo, useState } from "react"
import { formatUnits, parseUnits } from "@ethersproject/units"

import { AppState } from "../state/index"
import { BigNumber } from "@ethersproject/bignumber"
import SwapPage from "../components/SwapPage"
import { Zero } from "@ethersproject/constants"
import { calculateExchangeRate } from "../utils"
import { calculatePriceImpact } from "../utils/priceImpact"
import { debounce } from "lodash"
import { useApproveAndSwap } from "../hooks/useApproveAndSwap"
import usePoolData from "../hooks/usePoolData"
import { usePoolTokenBalances } from "../state/wallet/hooks"
import { useSelector } from "react-redux"
import { useSwapContract } from "../hooks/useContract"
import { useTranslation } from "react-i18next"

interface FormState {
  error: null | string
  from: {
    symbol: string
    value: string
    valueUSD: BigNumber
  }
  to: {
    symbol: string
    value: BigNumber
    valueUSD: BigNumber
  }
  priceImpact: BigNumber
  exchangeRate: BigNumber
}
interface Props {
  poolName: PoolName
}
function Swap({ poolName }: Props): ReactElement {
  const { t } = useTranslation()
  const [poolData] = usePoolData(poolName)
  const approveAndSwap = useApproveAndSwap(poolName)
  const tokenBalances = usePoolTokenBalances(poolName)
  const swapContract = useSwapContract(poolName)
  const POOL = POOLS_MAP[poolName]
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  function calculatePrice(
    amount: BigNumber | string,
    tokenPrice = 0,
    decimals?: number,
  ): BigNumber {
    // returns amount * price as BN 18 precision
    if (typeof amount === "string") {
      if (isNaN(+amount)) return Zero
      return parseUnits((+amount * tokenPrice).toFixed(2), 18)
    } else if (decimals != null) {
      return amount
        .mul(parseUnits(tokenPrice.toFixed(2), 18))
        .div(BigNumber.from(10).pow(decimals))
    }
    return Zero
  }

  const [formState, setFormState] = useState<FormState>({
    error: null,
    from: {
      symbol: POOL.poolTokens[0].symbol,
      value: "0.0",
      valueUSD: Zero,
    },
    to: {
      symbol: "",
      value: Zero,
      valueUSD: Zero,
    },
    priceImpact: Zero,
    exchangeRate: Zero,
  })
  // build a representation of pool tokens for the UI
  const tokens = useMemo(
    () =>
      POOL.poolTokens.map(({ symbol, name, icon, decimals }) => {
        const amount = tokenBalances ? tokenBalances[symbol] : Zero
        return {
          name,
          icon,
          symbol,
          decimals,
          amount,
          valueUSD: calculatePrice(amount, tokenPricesUSD?.[symbol], decimals),
          isAvailable: true, // TODO: refine for multipool
        }
      }),
    [tokenPricesUSD, tokenBalances, POOL.poolTokens],
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateSwapAmount = useCallback(
    debounce(async (formStateArg: FormState) => {
      if (swapContract == null || tokenBalances === null || poolData == null)
        return
      const cleanedFormFromValue = formStateArg.from.value.replace(/[$,]/g, "") // remove common copy/pasted financial characters
      if (
        cleanedFormFromValue === "" ||
        isNaN(+cleanedFormFromValue) ||
        formStateArg.to.symbol === ""
      ) {
        setFormState((prevState) => ({
          ...prevState,
          to: {
            ...prevState.to,
            value: Zero,
          },
          priceImpact: Zero,
        }))
        return
      }
      // TODO: improve the relationship between token / index
      const tokenIndexFrom = POOL.poolTokens.findIndex(
        ({ symbol }) => symbol === formStateArg.from.symbol,
      )
      const tokenIndexTo = POOL.poolTokens.findIndex(
        ({ symbol }) => symbol === formStateArg.to.symbol,
      )
      const amountToGive = parseUnits(
        cleanedFormFromValue,
        TOKENS_MAP[formStateArg.from.symbol].decimals,
      )
      let error: string | null = null
      let amountToReceive: BigNumber
      if (amountToGive.gt(tokenBalances[formStateArg.from.symbol])) {
        error = t("insufficientBalance")
      }
      if (amountToGive.isZero()) {
        amountToReceive = Zero
      } else {
        amountToReceive = await swapContract.calculateSwap(
          tokenIndexFrom,
          tokenIndexTo,
          amountToGive,
        )
      }
      const tokenTo = TOKENS_MAP[formStateArg.to.symbol]
      const tokenFrom = TOKENS_MAP[formStateArg.from.symbol]
      setFormState((prevState) => ({
        ...prevState,
        error,
        to: {
          ...prevState.to,
          value: amountToReceive,
          valueUSD: calculatePrice(
            amountToReceive,
            tokenPricesUSD?.[tokenTo.symbol],
            tokenTo.decimals,
          ),
        },
        priceImpact: calculatePriceImpact(
          amountToGive.mul(BigNumber.from(10).pow(18 - tokenFrom.decimals)),
          amountToReceive.mul(BigNumber.from(10).pow(18 - tokenTo.decimals)),
          poolData?.virtualPrice,
        ),
        exchangeRate: calculateExchangeRate(
          amountToGive,
          tokenFrom.decimals,
          amountToReceive,
          tokenTo.decimals,
        ),
      }))
    }, 250),
    [setFormState, swapContract, tokenBalances, poolData],
  )

  function handleUpdateAmountFrom(value: string): void {
    setFormState((prevState) => {
      const nextState = {
        ...prevState,
        to: {
          ...prevState.to,
          valueUSD: Zero,
        },
        from: {
          ...prevState.from,
          value,
          valueUSD: calculatePrice(
            value,
            tokenPricesUSD?.[prevState.from.symbol],
          ),
        },
        priceImpact: Zero,
        exchangeRate: Zero,
      }
      void calculateSwapAmount(nextState)
      return nextState
    })
  }
  function handleReverseExchangeDirection(): void {
    setFormState((prevState) => {
      const nextState = {
        error: null,
        from: {
          symbol: prevState.to.symbol,
          value: prevState.from.value,
          valueUSD: calculatePrice(
            prevState.from.value,
            tokenPricesUSD?.[prevState.to.symbol],
          ),
        },
        to: {
          symbol: prevState.from.symbol,
          value: Zero,
          valueUSD: Zero,
        },
        priceImpact: Zero,
        exchangeRate: Zero,
      }
      void calculateSwapAmount(nextState)
      return nextState
    })
  }
  function handleUpdateTokenFrom(symbol: string): void {
    if (symbol === formState.to.symbol) return handleReverseExchangeDirection()
    setFormState((prevState) => {
      const nextState = {
        ...prevState,
        error: null,
        from: {
          ...prevState.from,
          symbol,
          valueUSD: calculatePrice(
            prevState.from.value,
            tokenPricesUSD?.[symbol],
          ),
        },
        to: {
          ...prevState.to,
          value: Zero,
          valueUSD: Zero,
        },
        priceImpact: Zero,
        exchangeRate: Zero,
      }
      void calculateSwapAmount(nextState)
      return nextState
    })
  }

  function handleUpdateTokenTo(symbol: string): void {
    if (symbol === formState.from.symbol)
      return handleReverseExchangeDirection()
    setFormState((prevState) => {
      const nextState = {
        ...prevState,
        error: null,
        to: {
          ...prevState.to,
          value: Zero,
          symbol,
          valueUSD: Zero,
        },
        priceImpact: Zero,
        exchangeRate: Zero,
      }
      void calculateSwapAmount(nextState)
      return nextState
    })
  }

  async function handleConfirmTransaction(): Promise<void> {
    const fromToken = TOKENS_MAP[formState.from.symbol]
    await approveAndSwap({
      fromAmount: parseUnits(formState.from.value, fromToken.decimals),
      fromTokenSymbol: formState.from.symbol,
      toAmount: formState.to.value,
      toTokenSymbol: formState.to.symbol,
    })
    // Clear input after deposit
    setFormState((prevState) => ({
      error: null,
      from: {
        ...prevState.from,
        value: "0.0",
        valueUSD: Zero,
      },
      to: {
        ...prevState.to,
        value: Zero,
        valueUSD: Zero,
      },
      priceImpact: Zero,
      exchangeRate: Zero,
    }))
  }

  return (
    <SwapPage
      tokens={tokens}
      exchangeRateInfo={{
        pair: `${formState.from.symbol}/${formState.to.symbol}`,
        exchangeRate: formState.exchangeRate,
        priceImpact: formState.priceImpact,
      }}
      fromState={formState.from}
      toState={{
        ...formState.to,
        value:
          formState.to.symbol === ""
            ? "0"
            : formatUnits(
                formState.to.value,
                TOKENS_MAP[formState.to.symbol].decimals,
              ),
      }}
      onChangeFromAmount={handleUpdateAmountFrom}
      onChangeFromToken={handleUpdateTokenFrom}
      onChangeToToken={handleUpdateTokenTo}
      error={formState.error}
      onConfirmTransaction={handleConfirmTransaction}
      onClickReverseExchangeDirection={handleReverseExchangeDirection}
    />
  )
}

export default Swap
