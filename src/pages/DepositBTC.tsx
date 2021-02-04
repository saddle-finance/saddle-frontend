import {
  BTC_POOL_NAME,
  BTC_POOL_TOKENS,
  BTC_SWAP_TOKEN,
  RENBTC,
  SBTC,
  TBTC,
  WBTC,
} from "../constants"
import { DepositTransaction, TransactionItem } from "../interfaces/transactions"
import React, { ReactElement, useEffect, useState } from "react"
import { TokensStateType, useTokenFormState } from "../hooks/useTokenFormState"
import usePoolData, { PoolDataType } from "../hooks/usePoolData"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import DepositPage from "../components/DepositPage"
import { TokenPricesUSD } from "../state/application"
import { calculatePriceImpact } from "../utils/priceImpact"
import { formatBNToString } from "../utils"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "../hooks"
import { useApproveAndDeposit } from "../hooks/useApproveAndDeposit"
import useHistoricalPoolData from "../hooks/useHistoricalPoolData"
import { useSelector } from "react-redux"
import { useSwapContract } from "../hooks/useContract"
import { useTokenBalance } from "../state/wallet/hooks"
import { useUserMerkleProof } from "../hooks/useUserMerkleProof"

function DepositBTC(): ReactElement | null {
  const { account } = useActiveWeb3React()
  const { userMerkleProof, hasValidMerkleState } = useUserMerkleProof(
    BTC_POOL_NAME,
  )
  const approveAndDeposit = useApproveAndDeposit(BTC_POOL_NAME)
  const [poolData, userShareData] = usePoolData(BTC_POOL_NAME)
  const historicalPoolData = useHistoricalPoolData(BTC_POOL_NAME)
  const swapContract = useSwapContract(BTC_POOL_NAME)
  const [tokenFormState, updateTokenFormState] = useTokenFormState(
    BTC_POOL_TOKENS,
  )
  const {
    slippageCustom,
    slippageSelected,
    gasPriceSelected,
    gasCustom,
    infiniteApproval,
  } = useSelector((state: AppState) => state.user)
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  const [estDepositLPTokenAmount, setEstDepositLPTokenAmount] = useState(
    BigNumber.from(0),
  )
  const [priceImpact, setPriceImpact] = useState(BigNumber.from(0))
  const [willExceedMaxDeposits, setWillExceedMaxDeposit] = useState(true)

  useEffect(() => {
    // evaluate if a new deposit will exceed the pool's per-user limit
    async function calculateMaxDeposits(): Promise<void> {
      if (
        swapContract == null ||
        userShareData == null ||
        poolData == null ||
        account == null
      ) {
        setEstDepositLPTokenAmount(BigNumber.from(0))
        return
      }
      const tokenInputSum = parseUnits(
        BTC_POOL_TOKENS.reduce(
          (sum, { symbol }) => sum + (+tokenFormState[symbol].valueRaw || 0),
          0,
        ).toFixed(18),
        18,
      )
      let depositLPTokenAmount
      if (poolData.totalLocked.gt(0) && tokenInputSum.gt(0)) {
        depositLPTokenAmount = await swapContract.calculateTokenAmount(
          account,
          BTC_POOL_TOKENS.map(({ symbol }) => tokenFormState[symbol].valueSafe),
          true, // deposit boolean
        )
      } else {
        // when pool is empty, estimate the lptokens by just summing the input instead of calling contract
        depositLPTokenAmount = tokenInputSum
      }
      setEstDepositLPTokenAmount(depositLPTokenAmount)

      // check if the new deposit will violate the per-account level cap by comparing:
      // new deposit LP token amount + total LP token minted amount > poolAccountLimit
      const futureUserLPTokenMinted = depositLPTokenAmount.add(
        userShareData?.lpTokenMinted || BigNumber.from("0"),
      )
      // check if the new deposit will violate the pool level cap by comparing:
      // new deposit LP token amount + total pool LP token amount > poolLPTokenCap
      const futurePoolLPTokenBalance = depositLPTokenAmount.add(
        poolData.totalLocked,
      )
      const exceedsMaxDeposits =
        futureUserLPTokenMinted.gt(poolData.poolAccountLimit) ||
        futurePoolLPTokenBalance.gt(poolData.poolLPTokenCap)
      if (willExceedMaxDeposits !== exceedsMaxDeposits) {
        setWillExceedMaxDeposit(exceedsMaxDeposits)
      }

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
    willExceedMaxDeposits,
  ])
  // Account Token balances
  const tokenBalances = {
    [TBTC.symbol]: useTokenBalance(TBTC),
    [WBTC.symbol]: useTokenBalance(WBTC),
    [RENBTC.symbol]: useTokenBalance(RENBTC),
    [SBTC.symbol]: useTokenBalance(SBTC),
  }
  // A represention of tokens used for UI
  const tokens = BTC_POOL_TOKENS.map(({ symbol, name, icon, decimals }) => ({
    symbol,
    name,
    icon,
    max: formatBNToString(tokenBalances[symbol], decimals),
    inputValue: tokenFormState[symbol].valueRaw,
  }))

  if (userMerkleProof == null) {
    // TODO: replace with loader component
    return null
  }
  async function onConfirmTransaction(): Promise<void> {
    if (willExceedMaxDeposits && !poolData?.isAcceptingDeposits) return
    await approveAndDeposit({
      slippageCustom,
      slippageSelected,
      infiniteApproval,
      tokenFormState,
      gasPriceSelected,
      gasCustom,
      merkleData: {
        userMerkleProof: userMerkleProof || [],
        hasValidMerkleState,
      },
    })
    // Clear input after deposit
    updateTokenFormState(
      BTC_POOL_TOKENS.reduce(
        (acc, t) => ({
          ...acc,
          [t.symbol]: "0",
        }),
        {},
      ),
    )
  }
  function updateTokenFormValue(symbol: string, value: string): void {
    updateTokenFormState({ [symbol]: value })
  }
  const depositTransaction = buildTransactionData(
    tokenFormState,
    poolData,
    priceImpact,
    estDepositLPTokenAmount,
    tokenPricesUSD,
  )

  return (
    <DepositPage
      onConfirmTransaction={onConfirmTransaction}
      onChangeTokenInputValue={updateTokenFormValue}
      title="BTC Pool"
      tokens={tokens}
      poolData={poolData}
      historicalPoolData={historicalPoolData}
      myShareData={userShareData}
      transactionData={depositTransaction}
      infiniteApproval={infiniteApproval}
      willExceedMaxDeposits={willExceedMaxDeposits}
      isAcceptingDeposits={!!poolData?.isAcceptingDeposits}
      hasValidMerkleState={hasValidMerkleState}
    />
  )
}

function buildTransactionData(
  tokenFormState: TokensStateType,
  poolData: PoolDataType | null,
  priceImpact: BigNumber,
  estDepositLPTokenAmount: BigNumber,
  tokenPricesUSD?: TokenPricesUSD,
): DepositTransaction {
  const from = {
    items: [] as TransactionItem[],
    totalAmount: BigNumber.from(0),
    totalValueUSD: BigNumber.from(0),
  }
  BTC_POOL_TOKENS.forEach((token) => {
    const { symbol, decimals } = token
    const amount = BigNumber.from(tokenFormState[symbol].valueSafe)
    const usdPriceBN = parseUnits(
      (tokenPricesUSD?.[symbol] || 0).toFixed(2),
      18,
    )
    if (amount.lte("0")) return
    const item = {
      token,
      amount,
      singleTokenPriceUSD: usdPriceBN,
      valueUSD: amount.mul(usdPriceBN).div(BigNumber.from(10).pow(decimals)),
    }
    from.items.push(item)
    from.totalAmount = from.totalAmount.add(amount)
    from.totalValueUSD = from.totalValueUSD.add(usdPriceBN)
  })

  const lpTokenPriceUSD = poolData?.lpTokenPriceUSD || BigNumber.from(0)
  const toTotalValueUSD = estDepositLPTokenAmount
    .mul(lpTokenPriceUSD)
    ?.div(BigNumber.from(10).pow(BTC_SWAP_TOKEN.decimals))
  const to = {
    item: {
      token: BTC_SWAP_TOKEN,
      amount: estDepositLPTokenAmount,
      singleTokenPriceUSD: lpTokenPriceUSD,
      valueUSD: toTotalValueUSD,
    },
    totalAmount: estDepositLPTokenAmount,
    totalValueUSD: toTotalValueUSD,
  }
  const shareOfPool = poolData?.totalLocked.gt(0)
    ? estDepositLPTokenAmount
        .mul(BigNumber.from(10).pow(18))
        .div(estDepositLPTokenAmount.add(poolData?.totalLocked))
    : BigNumber.from(10).pow(18)
  return {
    from,
    to,
    priceImpact,
    shareOfPool,
  }
}

export default DepositBTC
