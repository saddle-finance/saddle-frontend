import { BTC_POOL_NAME, BTC_POOL_TOKENS, TOKENS_MAP } from "../constants"
import React, { ReactElement, useCallback, useState } from "react"
import { formatUnits, parseUnits } from "@ethersproject/units"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import SwapPage from "../components/SwapPage"
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
  }
  to: {
    symbol: string
    value: BigNumber
  }
  priceImpact: BigNumber
}
function SwapBTC(): ReactElement {
  const { t } = useTranslation()
  const [poolData] = usePoolData(BTC_POOL_NAME)
  const approveAndSwap = useApproveAndSwap(BTC_POOL_NAME)
  const {
    slippageCustom,
    slippageSelected,
    gasPriceSelected,
    gasCustom,
    infiniteApproval,
  } = useSelector((state: AppState) => state.user)
  // const [exchangeRate, setExchangeRate] = useState(0)
  const tokenBalances = usePoolTokenBalances(BTC_POOL_NAME)
  const swapContract = useSwapContract(BTC_POOL_NAME)
  const [formState, setFormState] = useState<FormState>({
    error: null,
    from: {
      symbol: BTC_POOL_TOKENS[0].symbol,
      value: "0.0",
    },
    to: {
      symbol: BTC_POOL_TOKENS[1].symbol,
      value: BigNumber.from("0"),
    },
    priceImpact: BigNumber.from("0"),
  })

  // build a representation of pool tokens for the UI
  const tokens = BTC_POOL_TOKENS.map(({ symbol, name, icon, decimals }) => ({
    name,
    icon,
    symbol,
    value: tokenBalances
      ? formatUnits(tokenBalances[symbol], decimals)
      : "0.00",
  }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateSwapAmount = useCallback(
    debounce(async (formStateArg) => {
      if (swapContract == null || tokenBalances === null || poolData == null)
        return
      const cleanedFormFromValue = formStateArg.from.value.replace(/[$,]/g, "") // remove common copy/pasted financial characters
      if (isNaN(cleanedFormFromValue) || cleanedFormFromValue === "") {
        setFormState((prevState) => ({
          ...prevState,
          to: {
            ...prevState.to,
            value: BigNumber.from("0"),
          },
          priceImpact: BigNumber.from("0"),
        }))
        return
      }
      // TODO: improve the relationship between token / index
      const tokenIndexFrom = BTC_POOL_TOKENS.findIndex(
        ({ symbol }) => symbol === formStateArg.from.symbol,
      )
      const tokenIndexTo = BTC_POOL_TOKENS.findIndex(
        ({ symbol }) => symbol === formStateArg.to.symbol,
      )
      const tokenAmount = parseUnits(
        cleanedFormFromValue,
        TOKENS_MAP[formStateArg.from.symbol].decimals,
      )
      let error: string | null = null
      let amountToReceive: BigNumber
      if (tokenAmount.isZero()) {
        amountToReceive = BigNumber.from("0")
      } else if (tokenAmount.gt(tokenBalances[formStateArg.from.symbol])) {
        error = t("insufficientBalance")
        amountToReceive = BigNumber.from("0")
      } else {
        amountToReceive = await swapContract.calculateSwap(
          tokenIndexFrom,
          tokenIndexTo,
          tokenAmount,
        )
      }
      const tokenTo = TOKENS_MAP[formStateArg.to.symbol]
      setFormState((prevState) => ({
        ...prevState,
        error,
        to: {
          ...prevState.to,
          value: amountToReceive,
        },
        priceImpact: calculatePriceImpact(
          parseUnits(formStateArg.from.value, 18),
          amountToReceive.mul(BigNumber.from(10).pow(18 - tokenTo.decimals)),
          poolData?.virtualPrice,
        ),
      }))
    }, 250),
    [setFormState, swapContract, tokenBalances, poolData],
  )

  function handleUpdateAmountFrom(value: string): void {
    setFormState((prevState) => {
      const nextState = {
        ...prevState,
        from: {
          ...prevState.from,
          value,
        },
        priceImpact: BigNumber.from("0"),
      }
      calculateSwapAmount(nextState)
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
        },
        to: {
          symbol: prevState.from.symbol,
          value: BigNumber.from("0"),
        },
        priceImpact: BigNumber.from("0"),
      }
      calculateSwapAmount(nextState)
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
        },
        to: {
          ...prevState.to,
          value: BigNumber.from("0"),
        },
        priceImpact: BigNumber.from("0"),
      }
      calculateSwapAmount(nextState)
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
          value: BigNumber.from("0"),
          symbol,
        },
        priceImpact: BigNumber.from("0"),
      }
      calculateSwapAmount(nextState)
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
      slippageCustom,
      slippageSelected,
      infiniteApproval,
      gasPriceSelected,
      gasCustom,
    })
    // Clear input after deposit
    setFormState((prevState) => ({
      error: null,
      from: {
        ...prevState.from,
        value: "0.0",
      },
      to: {
        ...prevState.to,
        value: BigNumber.from("0"),
      },
      priceImpact: BigNumber.from("0"),
    }))
  }

  const info = {
    isInfo: false,
    message: `${t("estimatedTxCost")} $3.14`,
  }
  return (
    <SwapPage
      tokens={tokens}
      exchangeRateInfo={{
        pair: `${formState.from.symbol}/${formState.to.symbol}`,
        priceImpact: formState.priceImpact,
      }}
      fromState={formState.from}
      toState={{
        ...formState.to,
        value: formatUnits(
          formState.to.value,
          TOKENS_MAP[formState.to.symbol].decimals,
        ),
      }}
      onChangeFromAmount={handleUpdateAmountFrom}
      onChangeFromToken={handleUpdateTokenFrom}
      onChangeToToken={handleUpdateTokenTo}
      error={formState.error}
      info={info}
      onConfirmTransaction={handleConfirmTransaction}
      onClickReverseExchangeDirection={handleReverseExchangeDirection}
    />
  )
}

export default SwapBTC
