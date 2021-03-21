import {
  BTC_POOL_NAME,
  BTC_POOL_TOKENS,
  STABLECOIN_POOL_NAME,
  STABLECOIN_POOL_TOKENS,
  TOKENS_MAP,
} from "../constants"
import React, { ReactElement, useCallback, useMemo, useState } from "react"
import { calculateExchangeRate, shiftBNDecimals } from "../utils"
import { formatUnits, parseUnits } from "@ethersproject/units"

import { AppState } from "../state/index"
import { BigNumber } from "@ethersproject/bignumber"
import SwapPage from "../components/SwapPage"
import { Zero } from "@ethersproject/constants"
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
interface TokenOption {
  symbol: string
  name: string
  valueUSD: BigNumber
  amount: BigNumber
  icon: string
  decimals: number
  isAvailable: boolean
}

function Swap(): ReactElement {
  const { t } = useTranslation()
  const approveAndSwap = useApproveAndSwap()
  const [btcPoolData] = usePoolData(BTC_POOL_NAME)
  const [usdPoolData] = usePoolData(STABLECOIN_POOL_NAME)
  const btcTokenBalances = usePoolTokenBalances(BTC_POOL_NAME)
  const usdTokenBalances = usePoolTokenBalances(STABLECOIN_POOL_NAME)
  const btcSwapContract = useSwapContract(BTC_POOL_NAME)
  const usdSwapContract = useSwapContract(STABLECOIN_POOL_NAME)
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  const ALL_POOLS_TOKENS = BTC_POOL_TOKENS.concat(STABLECOIN_POOL_TOKENS)
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
      symbol: "",
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
  const tokenBalances = useMemo(() => {
    return {
      ...(btcTokenBalances || {}),
      ...(usdTokenBalances || {}),
    }
  }, [btcTokenBalances, usdTokenBalances])
  const activePool = useMemo(() => {
    const BTC_POOL_SET = new Set(BTC_POOL_TOKENS.map(({ symbol }) => symbol))
    const USD_POOL_SET = new Set(
      STABLECOIN_POOL_TOKENS.map(({ symbol }) => symbol),
    )
    const ALL_POOLS_SET = new Set(ALL_POOLS_TOKENS.map(({ symbol }) => symbol))
    const One = BigNumber.from(10).pow(18)
    let activeSymbol = ""
    if (formState.from.symbol !== "") {
      activeSymbol = formState.from.symbol
    } else if (formState.to.symbol !== "") {
      activeSymbol = formState.to.symbol
    }
    if (BTC_POOL_SET.has(activeSymbol)) {
      return {
        name: BTC_POOL_NAME,
        tokens: BTC_POOL_TOKENS,
        tokensSet: BTC_POOL_SET,
        contract: btcSwapContract,
        virtualPrice: btcPoolData?.virtualPrice || One,
      }
    } else if (USD_POOL_SET.has(activeSymbol)) {
      return {
        name: STABLECOIN_POOL_NAME,
        tokens: STABLECOIN_POOL_TOKENS,
        tokensSet: USD_POOL_SET,
        contract: usdSwapContract,
        virtualPrice: usdPoolData?.virtualPrice || One,
      }
    } else {
      return {
        name: "ALL",
        tokens: ALL_POOLS_TOKENS,
        tokensSet: ALL_POOLS_SET,
        contract: null,
        virtualPrice: Zero,
      }
    }
  }, [
    formState.from.symbol,
    formState.to.symbol,
    ALL_POOLS_TOKENS,
    usdSwapContract,
    btcSwapContract,
    usdPoolData,
    btcPoolData,
  ])
  // build a representation of pool tokens for the UI
  const tokenOptions = useMemo(() => {
    const allTokens = ALL_POOLS_TOKENS.map(
      ({ symbol, name, icon, decimals }) => {
        const amount = tokenBalances?.[symbol] || Zero
        return {
          name,
          icon,
          symbol,
          decimals,
          amount,
          valueUSD: calculatePrice(amount, tokenPricesUSD?.[symbol], decimals),
          isAvailable: true,
        }
      },
    )
    // from: all tokens always available. to: limited by selected "from" token.
    return {
      from: allTokens.sort(sortTokenOptions),
      to: allTokens
        .map((t) => ({
          ...t,
          isAvailable: activePool.tokensSet.has(t.symbol),
        }))
        .sort(sortTokenOptions),
    }
  }, [tokenPricesUSD, tokenBalances, ALL_POOLS_TOKENS, activePool])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateSwapAmount = useCallback(
    debounce(async (formStateArg: FormState) => {
      if (activePool.contract == null || tokenBalances === null) return
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
      const tokenIndexFrom = activePool.tokens.findIndex(
        ({ symbol }) => symbol === formStateArg.from.symbol,
      )
      const tokenIndexTo = activePool.tokens.findIndex(
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
        amountToReceive = await activePool.contract.calculateSwap(
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
          activePool.virtualPrice,
        ),
        exchangeRate: calculateExchangeRate(
          amountToGive,
          tokenFrom.decimals,
          amountToReceive,
          tokenTo.decimals,
        ),
      }))
    }, 250),
    [setFormState, activePool, tokenBalances, activePool],
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
    const isChangingPools = !activePool.tokensSet.has(symbol)
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
          symbol: isChangingPools ? "" : prevState.to.symbol,
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
      swapContract: activePool.contract,
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
      tokenOptions={tokenOptions}
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

const sortTokenOptions = (a: TokenOption, b: TokenOption) => {
  if (a.isAvailable !== b.isAvailable) {
    return a.isAvailable ? -1 : 1
  }
  if (a.valueUSD.eq(b.valueUSD)) {
    const amountA = shiftBNDecimals(a.amount, 18 - a.decimals)
    const amountB = shiftBNDecimals(b.amount, 18 - b.decimals)
    return amountA.gt(amountB) ? -1 : 1
  } else if (a.valueUSD.gt(b.valueUSD)) {
    return -1
  }
  return 1
}
