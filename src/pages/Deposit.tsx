import { BasicToken, TokensContext } from "../providers/TokensProvider"
import {
  DepositBasicTransaction,
  TransactionBasicItem,
} from "../interfaces/transactions"
import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { TokensStateType, useTokenFormState } from "../hooks/useTokenFormState"
import { formatBNToString, getContract, shiftBNDecimals } from "../utils"
import { formatUnits, parseUnits } from "@ethersproject/units"
import usePoolData, { PoolDataType } from "../hooks/usePoolData"

import { AppState } from "../state"
import { BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import DepositPage from "../components/DepositPage"
import META_SWAP_ABI from "../constants/abis/metaSwap.json"
import { MetaSwap } from "../../types/ethers-contracts/MetaSwap"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { SwapFlashLoanNoWithdrawFee } from "../../types/ethers-contracts/SwapFlashLoanNoWithdrawFee"
import { TokenPricesUSD } from "../state/application"
import { Zero } from "@ethersproject/constants"
import { calculateGasEstimate } from "../utils/gasEstimate"
import { calculatePriceImpact } from "../utils/priceImpact"
import { formatGasToString } from "../utils/gas"
import { isWithdrawFeePool } from "../constants"
import { useActiveWeb3React } from "../hooks"
import { useApproveAndDeposit } from "../hooks/useApproveAndDeposit"
import { useParams } from "react-router-dom"
import { usePoolTokenBalances } from "../state/wallet/hooks"
import { useSelector } from "react-redux"
import { useSwapContract } from "../hooks/useContract"

function Deposit(): ReactElement | null {
  const { poolName } = useParams<{ poolName: string }>()
  const basicPools = useContext(BasicPoolsContext)
  const basicTokens = useContext(TokensContext)
  const pool = basicPools?.[poolName]
  const { account, library, chainId } = useActiveWeb3React()
  const approveAndDeposit = useApproveAndDeposit(poolName)
  const [poolData, userShareData] = usePoolData(poolName)
  const swapContract = useSwapContract(poolName)
  const allTokens = useMemo(() => {
    return Array.from(
      new Set(pool?.tokens.concat(pool?.underlyingTokens ?? [])),
    )
  }, [pool?.tokens, pool?.underlyingTokens])
  const lpToken = basicTokens?.[pool?.lpToken ?? ""]
  const allPoolTokens = useMemo(
    () => allTokens.map((token) => basicTokens?.[token]),
    [allTokens, basicTokens],
  )
  const poolUnderlyingTokens = useMemo(
    () => (pool?.underlyingTokens ?? []).map((token) => basicTokens?.[token]),
    [pool?.underlyingTokens, basicTokens],
  )
  const poolTokens = useMemo(
    () =>
      basicTokens && pool?.tokens
        ? pool.tokens.map((tokenAddr) => basicTokens?.[tokenAddr])
        : [],
    [basicTokens, pool?.tokens],
  )
  const poolBaseTokens = pool?.isMetaSwap ? poolUnderlyingTokens : poolTokens
  const [tokenFormState, updateTokenFormState] =
    useTokenFormState(allPoolTokens)
  const [shouldDepositWrapped, setShouldDepositWrapped] = useState(false)
  useEffect(() => {
    // empty out previous token state when switchng between wrapped and unwrapped
    if (shouldDepositWrapped) {
      updateTokenFormState(
        poolUnderlyingTokens.reduce(
          (acc, token) => ({
            ...acc,
            [token?.address ?? ""]: "",
          }),
          {},
        ),
      )
    } else {
      updateTokenFormState(
        poolTokens.reduce(
          (acc, token) => ({
            ...acc,
            [token?.address ?? ""]: "",
          }),
          {},
        ),
      )
    }
  }, [
    shouldDepositWrapped,
    updateTokenFormState,
    poolTokens,
    poolUnderlyingTokens,
  ])
  const tokenBalances = usePoolTokenBalances()
  const { tokenPricesUSD, gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )

  // Merge underlying token usd prices and tokenPricesUSD array
  const underlyingPoolName =
    Object.values(basicPools || {}).find(
      (basicPool) => basicPool.poolAddress === pool?.basePoolAddress,
    )?.poolName ?? ""

  const [underlyingPoolData] = usePoolData(underlyingPoolName)
  let newTokenPricesUSD = tokenPricesUSD
  if (underlyingPoolData.lpTokenPriceUSD != Zero) {
    const underlyingTokenUSDValue = parseFloat(
      formatBNToString(poolData.lpTokenPriceUSD, 18, 2),
    )
    newTokenPricesUSD = {
      ...tokenPricesUSD,
      ...{
        [underlyingPoolData.lpToken]: underlyingTokenUSDValue,
      },
    }
  }

  const { gasPriceSelected, gasCustom } = useSelector(
    (state: AppState) => state.user,
  )
  const gasPrice = BigNumber.from(
    formatGasToString(
      { gasStandard, gasFast, gasInstant },
      gasPriceSelected,
      gasCustom,
    ),
  )
  const [estDepositLPTokenAmount, setEstDepositLPTokenAmount] = useState(Zero)
  const [priceImpact, setPriceImpact] = useState(Zero)
  const metaSwapContract = useMemo(() => {
    if (!pool || !chainId || !library) return null
    if (pool.isMetaSwap) {
      return getContract(
        pool.poolAddress,
        META_SWAP_ABI,
        library,
        account ?? undefined,
      ) as MetaSwap
    }
    return null
  }, [pool, chainId, library, account])

  useEffect(() => {
    // evaluate if a new deposit will exceed the pool's per-user limit
    async function calculateMaxDeposits(): Promise<void> {
      if (
        swapContract == null ||
        userShareData == null ||
        poolData == null ||
        account == null
      ) {
        setEstDepositLPTokenAmount(Zero)
        return
      }
      const tokenInputSum = parseUnits(
        allPoolTokens
          .reduce(
            (sum, token) =>
              sum + (+tokenFormState[token?.address ?? ""]?.valueRaw || 0),
            0,
          )
          .toFixed(18),
        18,
      )
      let depositLPTokenAmount
      if (poolData.totalLocked.gt(0) && tokenInputSum.gt(0)) {
        if (isWithdrawFeePool(poolData.name)) {
          depositLPTokenAmount = await (
            swapContract as SwapFlashLoan
          ).calculateTokenAmount(
            account,
            poolBaseTokens.map(
              (token) => tokenFormState[token?.address ?? ""]?.valueSafe ?? "0",
            ),
            true, // deposit boolean
          )
        } else if (shouldDepositWrapped) {
          depositLPTokenAmount = metaSwapContract
            ? await metaSwapContract.calculateTokenAmount(
                poolTokens.map(
                  (token) =>
                    tokenFormState[token?.address ?? ""]?.valueSafe ?? "0",
                ),
                true, // deposit boolean
              )
            : Zero
        } else {
          depositLPTokenAmount = await (
            swapContract as SwapFlashLoanNoWithdrawFee
          ).calculateTokenAmount(
            poolBaseTokens.map(
              (token) => tokenFormState[token?.address ?? ""]?.valueSafe ?? "0",
            ),
            true, // deposit boolean
          )
        }
      } else {
        // when pool is empty, estimate the lptokens by just summing the input instead of calling contract
        depositLPTokenAmount = tokenInputSum
      }
      setEstDepositLPTokenAmount(depositLPTokenAmount)

      setPriceImpact(
        calculatePriceImpact(
          tokenInputSum,
          depositLPTokenAmount,
          poolData.virtualPrice,
        ),
      )
    }
    void calculateMaxDeposits()
  }, [
    poolData,
    tokenFormState,
    swapContract,
    userShareData,
    account,
    metaSwapContract,
    shouldDepositWrapped,
    allPoolTokens,
    poolTokens,
    poolUnderlyingTokens,
    poolBaseTokens,
  ])

  // A represention of tokens used for UI
  const tmpDepositTokens = shouldDepositWrapped ? poolTokens : poolBaseTokens
  const tokens = tmpDepositTokens.map((token, i) => {
    if (!token)
      return {
        address: "",
        symbol: "",
        name: "",
        decimals: 18,
        priceUSD: 0,
        max: "0",
        inputValue: "0.0",
        isOnTokenLists: false,
      }

    const priceUSD =
      (shouldDepositWrapped && i === tmpDepositTokens.length - 1
        ? parseFloat(formatUnits(poolData.lpTokenPriceUSD, 18))
        : tokenPricesUSD?.[token.address]) || 0

    return {
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      isOnTokenLists: token.isOnTokenLists,
      priceUSD,
      max: formatBNToString(
        tokenBalances?.[token.address] || Zero,
        token.decimals,
      ),
      inputValue: tokenFormState[token.address]?.valueRaw,
    }
  })

  const exceedsWallet = allPoolTokens.some((token) => {
    if (!token || !tokenBalances) return false

    const exceedsBoolean = (tokenBalances[token.address] || Zero).lt(
      BigNumber.from(tokenFormState[token.address]?.valueSafe ?? "0"),
    )

    return exceedsBoolean
  })

  async function onConfirmTransaction(): Promise<void> {
    await approveAndDeposit(tokenFormState, shouldDepositWrapped)
    // Clear input after deposit
    updateTokenFormState(
      allPoolTokens.reduce(
        (acc, t) => ({
          ...acc,
          [t?.address ?? ""]: "",
        }),
        {},
      ),
    )
  }
  function updateTokenFormValue(address: string, value: string): void {
    updateTokenFormState({ [address]: value })
  }
  const depositTransaction = buildTransactionData(
    tokenFormState,
    poolData,
    shouldDepositWrapped ? poolTokens : poolBaseTokens,
    lpToken,
    priceImpact,
    estDepositLPTokenAmount,
    gasPrice,
    newTokenPricesUSD,
  )

  return (
    <DepositPage
      onConfirmTransaction={onConfirmTransaction}
      onChangeTokenInputValue={updateTokenFormValue}
      onToggleDepositWrapped={() =>
        setShouldDepositWrapped((prevState) => !prevState)
      }
      shouldDepositWrapped={shouldDepositWrapped}
      title={poolName}
      tokens={tokens}
      exceedsWallet={exceedsWallet}
      poolData={poolData}
      myShareData={userShareData}
      transactionData={depositTransaction}
    />
  )
}

function buildTransactionData(
  tokenFormState: TokensStateType,
  poolData: PoolDataType | null,
  poolTokens: (BasicToken | undefined)[],
  poolLpToken: BasicToken | undefined,
  priceImpact: BigNumber,
  estDepositLPTokenAmount: BigNumber,
  gasPrice: BigNumber,
  tokenPricesUSD?: TokenPricesUSD,
): DepositBasicTransaction | null {
  const from = {
    items: [] as TransactionBasicItem[],
    totalAmount: Zero,
    totalValueUSD: Zero,
  }
  const TOTAL_AMOUNT_DECIMALS = 18
  poolTokens.forEach((token) => {
    if (!token) return
    const amount = BigNumber.from(
      tokenFormState[token.address]?.valueSafe ?? "0",
    )
    const usdPriceBN = parseUnits(
      (tokenPricesUSD?.[token.address] || 0).toFixed(2),
      18,
    )
    if (amount.lte("0")) return
    const item = {
      token,
      amount,
      singleTokenPriceUSD: usdPriceBN,
      valueUSD: amount
        .mul(usdPriceBN)
        .div(BigNumber.from(10).pow(token.decimals)),
    }
    from.items.push(item)
    from.totalAmount = from.totalAmount.add(
      shiftBNDecimals(amount, TOTAL_AMOUNT_DECIMALS - token.decimals),
    )
    from.totalValueUSD = from.totalValueUSD.add(usdPriceBN)
  })

  if (!poolData) return null
  const lpTokenPriceUSD = poolData.lpTokenPriceUSD
  if (!poolLpToken) return null
  const toTotalValueUSD = estDepositLPTokenAmount
    .mul(lpTokenPriceUSD)
    ?.div(BigNumber.from(10).pow(poolLpToken.decimals))
  const to = {
    item: {
      token: poolLpToken,
      amount: estDepositLPTokenAmount,
      singleTokenPriceUSD: lpTokenPriceUSD,
      valueUSD: toTotalValueUSD,
    },
    totalAmount: estDepositLPTokenAmount,
    totalValueUSD: toTotalValueUSD,
  }
  const shareOfPool = poolData.totalLocked.gt(0)
    ? estDepositLPTokenAmount
        .mul(BigNumber.from(10).pow(18))
        .div(estDepositLPTokenAmount.add(poolData.totalLocked))
    : BigNumber.from(10).pow(18)
  const gasAmount = calculateGasEstimate("addLiquidity").mul(gasPrice) // units of gas * GWEI/Unit of gas

  const txnGasCost = {
    amount: gasAmount,
    valueUSD: tokenPricesUSD?.ETH
      ? parseUnits(tokenPricesUSD.ETH.toFixed(2), 18) // USD / ETH  * 10^18
          .mul(gasAmount) // GWEI
          .div(BigNumber.from(10).pow(25)) // USD / ETH * GWEI * ETH / GWEI = USD
      : null,
  }

  return {
    from,
    to,
    priceImpact,
    shareOfPool,
    txnGasCost,
  }
}

export default Deposit
