import { IS_VIRTUAL_SWAP_ACTIVE, SWAP_TYPES } from "../../constants"
import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  SwapData,
  SwapSide,
  useCalculateSwapPairs,
} from "../../hooks/useCalculateSwapPairs"
import {
  calculateExchangeRate,
  calculatePrice,
  shiftBNDecimals,
} from "../../utils"
import { formatUnits, parseUnits } from "@ethersproject/units"
import {
  useBridgeContract,
  useSwapContract,
  useSynthetixExchangeRatesContract,
} from "../../hooks/useContract"

import { AppState } from "../../state/index"
import { BasicPoolsContext } from "../../providers/BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import { PendingSwapsContext } from "../../providers/PendingSwapsProvider"
import SwapPage from "../../components/SwapPage"
import { TokenOption } from "../../types"
import { TokensContext } from "../../providers/TokensProvider"
import { Zero } from "@ethersproject/constants"
import { calculateGasEstimate } from "../../utils/gasEstimate"
import { calculatePriceImpact } from "../../utils/priceImpact"
import { debounce } from "lodash"
import { enqueueToast } from "../../components/Toastify"
import { formatGasToString } from "../../utils/gas"
import { useActiveWeb3React } from "../../hooks"
import { useApproveAndSwap } from "../../hooks/useApproveAndSwap"
import { usePoolTokenBalances } from "../../state/wallet/hooks"
import { useSelector } from "react-redux"
import { useTokenMaps } from "../../hooks/useTokenMaps"
import { useTranslation } from "react-i18next"
import { utils } from "ethers"

type FormState = {
  error: null | string
  from: {
    value: string
    valueUSD: BigNumber
  } & SwapSide
  to: {
    value: BigNumber
    valueUSD: BigNumber
    valueSynth: BigNumber
  } & SwapSide
  priceImpact: BigNumber
  exchangeRate: BigNumber
  route: string[]
  swapType: SWAP_TYPES
  currentSwapPairs: SwapData[]
}

const EMPTY_FORM_STATE = {
  error: null,
  from: {
    address: "",
    symbol: "",
    value: "0.0",
    valueUSD: Zero,
  },
  to: {
    address: "",
    symbol: "",
    value: Zero,
    valueUSD: Zero,
    valueSynth: Zero,
  },
  priceImpact: Zero,
  exchangeRate: Zero,
  route: [],
  swapType: SWAP_TYPES.INVALID,
  currentSwapPairs: [],
}

function Swap(): ReactElement {
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()
  const approveAndSwap = useApproveAndSwap()
  const tokenBalances = usePoolTokenBalances()
  const basicPools = useContext(BasicPoolsContext)
  const tokens = useContext(TokensContext)
  const { tokenAddrToPoolNameMap } = useTokenMaps()
  const bridgeContract = useBridgeContract()
  const snxEchangeRatesContract = useSynthetixExchangeRatesContract()
  const calculateSwapPairs = useCalculateSwapPairs()
  const pendingSwapData = useContext(PendingSwapsContext)
  const { tokenPricesUSD, gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const { gasPriceSelected, gasCustom } = useSelector(
    (state: AppState) => state.user,
  )

  const [formState, setFormState] = useState<FormState>(EMPTY_FORM_STATE)
  const [prevFormState, setPrevFormState] =
    useState<FormState>(EMPTY_FORM_STATE)
  const [openFrom, setOpenFrom] = useState(false)
  const [openTo, setOpenTo] = useState(false)
  useEffect(() => {
    setFormState(EMPTY_FORM_STATE)
    setOpenFrom(false)
    setPrevFormState(EMPTY_FORM_STATE)
    setOpenTo(false)
  }, [chainId])

  const swapContract = useSwapContract(formState.to.poolName)

  // build a representation of pool tokens for the UI
  const tokenOptions = useMemo(() => {
    if (!chainId || !tokenBalances || !tokens)
      return {
        from: [],
        to: [],
      }

    const allTokens = Object.values(tokens || {})
      .filter(({ isLPToken }) => !isLPToken)
      .filter(({ address }) => {
        // get list of pools containing the token
        if (!tokenAddrToPoolNameMap[tokens[address]?.address ?? ""])
          return false
        const tokenPools =
          tokenAddrToPoolNameMap[tokens[address]?.address ?? ""]
        // ensure at least one pool is unpaused to include token in swappable list
        const hasAnyUnpaused = tokenPools.some((poolName) => {
          if (!basicPools) return false
          const basicPool = basicPools[poolName]
          if (!basicPool) return false
          return !basicPool.isPaused
        })
        // only show pools with balances
        const hasAnyBalance = tokenPools.some((poolName) => {
          if (!basicPools) return false
          const basicPool = basicPools[poolName]
          if (!basicPool) return false
          return basicPool.lpTokenSupply.gt(Zero)
        })
        return hasAnyUnpaused && hasAnyBalance
      })
      .map(({ address, symbol, name, decimals, isOnTokenLists }) => {
        const amount = tokenBalances[address] || Zero
        return {
          address,
          name,
          symbol,
          decimals,
          amount,
          valueUSD: calculatePrice(amount, tokenPricesUSD?.[address], decimals),
          isAvailable: true,
          isOnTokenLists,
          swapType: null,
        }
      })
      .sort(sortTokenOptions)
    const toTokens =
      formState.currentSwapPairs.length > 0
        ? (
            formState.currentSwapPairs
              .map(({ to, type: swapType }) => {
                if (!tokens[to.address]?.address) {
                  console.log("unknown symbol", { to, swapType })
                  return null
                }
                if (!tokens) return null
                const token = tokens[to.address]
                if (!token) return null
                const amount = tokenBalances[token.address]
                return {
                  name: token.name,
                  address: token.address,
                  symbol: token.symbol,
                  decimals: token.decimals,
                  amount,
                  isOnTokenLists: token.isOnTokenLists,
                  valueUSD: calculatePrice(
                    amount,
                    tokenPricesUSD?.[token.address],
                    token.decimals,
                  ),
                  swapType,
                  isAvailable: IS_VIRTUAL_SWAP_ACTIVE
                    ? swapType !== SWAP_TYPES.INVALID
                    : swapType === SWAP_TYPES.DIRECT, // TODO replace once VSwaps are live
                }
              })
              .filter(Boolean) as TokenOption[]
          )
            .sort(sortTokenOptions)
            .sort((a, b) => Number(b.isOnTokenLists) - Number(a.isOnTokenLists))
        : allTokens
    // from: all tokens always available. to: limited by selected "from" token.
    return {
      from: allTokens,
      to: toTokens,
    }
  }, [
    tokenAddrToPoolNameMap,
    tokens,
    tokenPricesUSD,
    tokenBalances,
    formState.currentSwapPairs,
    chainId,
    basicPools,
  ])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateSwapAmount = useCallback(
    debounce(async (formStateArg: FormState) => {
      if (!tokens) return
      const tokenFrom = tokens[formStateArg.from.address]
      const tokenTo = tokens[formStateArg.to.address]
      if (!tokenFrom || !tokenTo || !basicPools) return
      if (formStateArg.swapType === SWAP_TYPES.INVALID) return
      if (tokenBalances === null || chainId == null)
        // || bridgeContract == null
        return
      if (
        formStateArg.from.tokenIndex === undefined ||
        formStateArg.from.poolName === undefined ||
        formStateArg.to.tokenIndex === undefined ||
        formStateArg.to.poolName === undefined
      )
        return
      const cleanedFormFromValue = formStateArg.from.value.replace(/[$,]/g, "") // remove common copy/pasted financial characters
      if (
        cleanedFormFromValue === "" ||
        isNaN(+cleanedFormFromValue) ||
        tokens[formStateArg.to.address]?.address === ""
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
      const amountToGive = parseUnits(cleanedFormFromValue, tokenFrom.decimals)
      let error: string | null = null
      let amountToReceive = Zero
      let amountMediumSynth = Zero
      const tokenAddr = tokens[formStateArg.from.address]?.address
      if (!tokenAddr) return
      if (amountToGive.gt(tokenBalances[tokenAddr] || Zero)) {
        error = t("insufficientBalance")
      }
      if (amountToGive.isZero()) {
        amountToReceive = Zero
      } else if (
        formStateArg.swapType === SWAP_TYPES.TOKEN_TO_TOKEN &&
        bridgeContract != null
      ) {
        const originPool = basicPools[formStateArg.from.poolName]
        const destinationPool = basicPools[formStateArg.to.poolName]
        if (
          !originPool?.metaSwapDepositAddress ||
          !destinationPool?.metaSwapDepositAddress
        ) {
          error = "Unable to find metaSwap deposit address t2t"
          amountToReceive = Zero
          amountMediumSynth = Zero
        } else {
          const [amountOutSynth, amountOutToken] =
            await bridgeContract.calcTokenToToken(
              [
                originPool.metaSwapDepositAddress,
                destinationPool.metaSwapDepositAddress,
              ],
              formStateArg.from.tokenIndex,
              formStateArg.to.tokenIndex,
              amountToGive,
            )
          amountToReceive = amountOutToken
          amountMediumSynth = amountOutSynth
        }
      } else if (
        formStateArg.swapType === SWAP_TYPES.SYNTH_TO_TOKEN &&
        bridgeContract != null
      ) {
        const destinationPool = basicPools[formStateArg.to.poolName]
        if (!destinationPool?.metaSwapDepositAddress) {
          error = "Unable to find metaSwap deposit address s2t"
          amountToReceive = Zero
          amountMediumSynth = Zero
        } else {
          const tokenAddr = tokens[formStateArg.from.address]?.address
          if (!tokenAddr) return
          const [amountOutSynth, amountOutToken] =
            await bridgeContract.calcSynthToToken(
              destinationPool.metaSwapDepositAddress,
              utils.formatBytes32String(formStateArg.from.symbol),
              formStateArg.to.tokenIndex,
              amountToGive,
            )
          amountToReceive = amountOutToken
          amountMediumSynth = amountOutSynth
        }
      } else if (
        formStateArg.swapType === SWAP_TYPES.TOKEN_TO_SYNTH &&
        bridgeContract != null
      ) {
        const originPool = basicPools[formStateArg.from.poolName]
        if (!originPool?.metaSwapDepositAddress) {
          error = "Unable to find metaSwap deposit address t2s"
          amountToReceive = Zero
          amountMediumSynth = Zero
        } else {
          const tokenAddr = tokens[formStateArg.to.address]?.address
          if (!tokenAddr) return
          amountToReceive = await bridgeContract.calcTokenToSynth(
            originPool.metaSwapDepositAddress,
            formStateArg.from.tokenIndex,
            utils.formatBytes32String(formStateArg.to.symbol),
            amountToGive,
          )
        }
      } else if (
        formStateArg.swapType === SWAP_TYPES.DIRECT &&
        swapContract != null
      ) {
        amountToReceive = await swapContract.calculateSwap(
          formStateArg.from.tokenIndex,
          formStateArg.to.tokenIndex,
          amountToGive,
        )
      } else if (
        formStateArg.swapType === SWAP_TYPES.SYNTH_TO_SYNTH &&
        snxEchangeRatesContract != null
      ) {
        const fromTokenAddr = tokens[formStateArg.from.address]?.address
        const toTokenAddr = tokens[formStateArg.to.address]?.address
        if (!fromTokenAddr || !toTokenAddr) return
        amountToReceive = await snxEchangeRatesContract.effectiveValue(
          utils.formatBytes32String(formStateArg.from.symbol),
          amountToGive,
          utils.formatBytes32String(formStateArg.to.symbol),
        )
      }
      const tokenToAddr = tokens[tokenTo.address]?.address
      if (!tokenToAddr) return
      const toValueUSD = calculatePrice(
        amountToReceive,
        tokenPricesUSD?.[tokenToAddr],
        tokenTo.decimals,
      )
      const priceImpact = calculatePriceImpact(
        formStateArg.from.valueUSD,
        toValueUSD,
      )
      setFormState((prevState) => {
        const newState = {
          ...prevState,
          error,
          to: {
            ...prevState.to,
            value: amountToReceive,
            valueUSD: toValueUSD,
            valueSynth: amountMediumSynth,
          },
          priceImpact,
          exchangeRate: calculateExchangeRate(
            amountToGive,
            tokenFrom.decimals,
            amountToReceive,
            tokenTo.decimals,
          ),
        }
        setPrevFormState(newState)
        return newState
      })
    }, 250),
    [tokenBalances, swapContract, bridgeContract, chainId, tokenPricesUSD],
  )

  useEffect(() => {
    // watch user input fields and calculate other fields if necessary
    if (
      prevFormState.from.address !== formState.from.address ||
      prevFormState.from.value !== formState.from.value ||
      prevFormState.to.address !== formState.to.address
    ) {
      void calculateSwapAmount(formState)
    }
  }, [prevFormState, formState, calculateSwapAmount])

  function handleUpdateAmountFrom(value: string): void {
    if (!tokens) return
    setFormState((prevState) => {
      const tokenAddr = tokens[prevState.from.address]?.address
      if (!tokenAddr) return prevState
      const nextState = {
        ...prevState,
        to: {
          ...prevState.to,
          valueUSD: Zero,
          valueSynth: Zero,
        },
        from: {
          ...prevState.from,
          value,
          valueUSD: calculatePrice(value, tokenPricesUSD?.[tokenAddr]),
        },
        priceImpact: Zero,
        exchangeRate: Zero,
      }
      return nextState
    })
  }
  function handleReverseExchangeDirection(): void {
    setFormState((prevState) => {
      if (!tokens) return EMPTY_FORM_STATE
      const swapPairs = calculateSwapPairs(tokens[prevState.to.address])
      const activeSwapPair = swapPairs.find(
        (pair) =>
          tokens[pair.to.address]?.address ===
          tokens[prevState.from.address]?.address,
      )
      const nextState = {
        error: null,
        from: {
          address: prevState.to.address,
          symbol: prevState.to.symbol,
          value: prevState.from.value,
          valueUSD: calculatePrice(
            prevState.from.value,
            tokenPricesUSD?.[prevState.to.address],
          ),
          poolName: activeSwapPair?.from.poolName,
          tokenIndex: activeSwapPair?.from.tokenIndex,
        },
        to: {
          address: prevState.from.address,
          symbol: prevState.from.symbol,
          value: Zero,
          valueUSD: Zero,
          valueSynth: Zero,
          poolName: activeSwapPair?.to.poolName,
          tokenIndex: activeSwapPair?.to.tokenIndex,
        },
        priceImpact: Zero,
        exchangeRate: Zero,
        route: activeSwapPair?.route || [],
        currentSwapPairs: swapPairs,
        swapType: activeSwapPair?.type || SWAP_TYPES.INVALID,
      }
      return nextState
    })
  }
  function handleUpdateTokenFrom(address: string): void {
    if (!tokens || !tokenPricesUSD || !tokens[address]) return
    setOpenFrom(!tokens[address]?.isOnTokenLists)
    if (address === formState.to.address)
      return handleReverseExchangeDirection()
    setFormState((prevState) => {
      const swapPairs = calculateSwapPairs(tokens[address])
      const activeSwapPair = swapPairs.find(
        (pair) => pair.to.address === prevState.to.address,
      )
      const isValidSwap =
        IS_VIRTUAL_SWAP_ACTIVE && activeSwapPair
          ? activeSwapPair.type !== SWAP_TYPES.INVALID
          : activeSwapPair?.type === SWAP_TYPES.DIRECT
      const fromTokenSymbol = tokens[address]?.symbol
      const fromTokenAddr = tokens[address]?.address
      const toTokenSymbol = tokens[prevState.to.address]?.symbol
      if (!fromTokenSymbol || !fromTokenAddr) return prevState
      const nextState = {
        ...prevState,
        error: null,
        from: {
          ...prevState.from,
          symbol: fromTokenSymbol,
          address,
          valueUSD: calculatePrice(
            prevState.from.value,
            tokenPricesUSD[fromTokenAddr],
          ),
          poolName: activeSwapPair?.from.poolName,
          tokenIndex: activeSwapPair?.from.tokenIndex,
        },
        to: {
          ...prevState.to,
          value: Zero,
          valueSynth: Zero,
          valueUSD: Zero,
          symbol: isValidSwap ? toTokenSymbol ?? "" : "",
          poolName: isValidSwap ? activeSwapPair?.to.poolName : undefined,
          tokenIndex: isValidSwap ? activeSwapPair?.to.tokenIndex : undefined,
        },
        priceImpact: Zero,
        exchangeRate: Zero,
        route: activeSwapPair?.route || [],
        currentSwapPairs: swapPairs,
        swapType: activeSwapPair?.type || SWAP_TYPES.INVALID,
      }
      return nextState
    })
  }

  function handleUpdateTokenTo(address: string): void {
    if (!tokens?.[address]) return
    !tokens[address]?.isOnTokenLists ? setOpenTo(true) : setOpenTo(false)
    if (address === formState.from.address)
      return handleReverseExchangeDirection()
    setFormState((prevState) => {
      const activeSwapPair = prevState.currentSwapPairs.find(
        (pair) => pair.to.address === address,
      )
      const toTokenSymbol = tokens[address]?.symbol
      const nextState = {
        ...prevState,
        from: {
          ...prevState.from,
          ...(activeSwapPair?.from || {}),
        },
        error: null,
        to: {
          ...prevState.to,
          value: Zero,
          valueSynth: Zero,
          symbol: toTokenSymbol ?? "",
          address,
          valueUSD: Zero,
          poolName: activeSwapPair?.to.poolName,
          tokenIndex: activeSwapPair?.to.tokenIndex,
        },
        priceImpact: Zero,
        exchangeRate: Zero,
        route: activeSwapPair?.route || [],
        swapType: activeSwapPair?.type || SWAP_TYPES.INVALID,
      }
      return nextState
    })
  }

  async function handleConfirmTransaction(): Promise<void> {
    if (!tokens) {
      console.error("Unable to obtain tokens info")
      enqueueToast("error", "Unable to obtain tokens info")
      return
    }
    const fromToken = tokens[formState.from.address]
    if (
      formState.swapType === SWAP_TYPES.INVALID ||
      formState.from.tokenIndex === undefined ||
      formState.from.poolName === undefined ||
      formState.to.tokenIndex === undefined ||
      formState.to.poolName === undefined ||
      !fromToken
    ) {
      console.debug("Invalid transaction", formState)
      setFormState((prevState) => ({
        ...EMPTY_FORM_STATE,
        error: "Invalid Transaction",
        from: {
          ...prevState.from,
          value: "0.0",
          valueUSD: Zero,
        },
      }))
      return
    }
    if (!fromToken.decimals) return
    await approveAndSwap({
      bridgeContract: bridgeContract,
      swapContract: swapContract,
      from: {
        address: formState.from.address,
        amount: parseUnits(formState.from.value, fromToken.decimals),
        symbol: formState.from.symbol,
        poolName: formState.from.poolName,
        tokenIndex: formState.from.tokenIndex,
      },
      to: {
        address: formState.to.address,
        amount: formState.to.value,
        symbol: formState.to.symbol,
        poolName: formState.to.poolName,
        tokenIndex: formState.to.tokenIndex,
        amountMediumSynth: formState.to.valueSynth,
      },
      swapType: formState.swapType,
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
      route: prevState.route,
      currentSwapPairs: prevState.currentSwapPairs,
      swapType: prevState.swapType,
    }))
  }

  const gasPrice = BigNumber.from(
    formatGasToString(
      { gasStandard, gasFast, gasInstant },
      gasPriceSelected,
      gasCustom,
    ),
  )
  const gasAmount = calculateGasEstimate(formState.swapType).mul(gasPrice) // units of gas * GWEI/Unit of gas

  const txnGasCost = {
    amount: gasAmount,
    valueUSD: tokenPricesUSD?.ETH
      ? parseUnits(tokenPricesUSD.ETH.toFixed(2), 18) // USD / ETH  * 10^18
          .mul(gasAmount) // GWEI
          .div(BigNumber.from(10).pow(25)) // USD / ETH * GWEI * ETH / GWEI = USD
      : null,
  }

  return (
    <SwapPage
      pendingSwaps={pendingSwapData}
      tokenOptions={tokenOptions}
      exchangeRateInfo={{
        pair: `${formState.from.symbol}/${formState.to.symbol}`,
        exchangeRate: formState.exchangeRate,
        priceImpact: formState.priceImpact,
        route: formState.route,
      }}
      txnGasCost={txnGasCost}
      fromState={formState.from}
      toState={{
        ...formState.to,
        value:
          formState.to.address === ""
            ? "0"
            : formatUnits(
                formState.to.value,
                tokens?.[formState.to.address]?.decimals,
              ),
      }}
      swapType={formState.swapType}
      onChangeFromAmount={handleUpdateAmountFrom}
      onChangeFromToken={handleUpdateTokenFrom}
      onChangeToToken={handleUpdateTokenTo}
      error={formState.error}
      onConfirmTransaction={handleConfirmTransaction}
      onClickReverseExchangeDirection={handleReverseExchangeDirection}
      openFrom={openFrom}
      setOpenFrom={setOpenFrom}
      openTo={openTo}
      setOpenTo={setOpenTo}
    />
  )
}

export default Swap

const sortTokenOptions = (a: TokenOption, b: TokenOption) => {
  if (a.isAvailable !== b.isAvailable) {
    return a.isAvailable ? -1 : 1
  }
  // if either is invalid, put the valid one first
  if (a.swapType === SWAP_TYPES.INVALID || b.swapType === SWAP_TYPES.INVALID) {
    return a.swapType === SWAP_TYPES.INVALID ? 1 : -1
  }
  if (a.valueUSD.gt(b.valueUSD)) {
    // prefer largest wallet balance
    return -1
  } else if (a.valueUSD.gt(Zero) && a.valueUSD.eq(b.valueUSD)) {
    const amountA = shiftBNDecimals(a.amount, 18 - a.decimals)
    const amountB = shiftBNDecimals(b.amount, 18 - b.decimals)
    return amountA.gt(amountB) ? -1 : 1
  }
  // prefer direct swaps
  return a.swapType === SWAP_TYPES.DIRECT ? -1 : 1
}
