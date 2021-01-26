import {
  BTC_POOL_NAME,
  BTC_POOL_TOKENS,
  RENBTC,
  SBTC,
  TBTC,
  WBTC,
} from "../constants"
import React, { ReactElement, useEffect, useState } from "react"
import { commify, formatUnits } from "@ethersproject/units"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import DepositPage from "../components/DepositPage"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "../hooks"
import { useApproveAndDeposit } from "../hooks/useApproveAndDeposit"
import useHistoricalPoolData from "../hooks/useHistoricalPoolData"
import usePoolData from "../hooks/usePoolData"
import { useSelector } from "react-redux"
import { useSwapContract } from "../hooks/useContract"
import { useTokenBalance } from "../state/wallet/hooks"
import { useTokenFormState } from "../hooks/useTokenFormState"
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
  const [estDepositBonus, setEstDepositBonus] = useState(BigNumber.from(0))
  const [willExceedMaxDeposits, setWillExceedMaxDeposit] = useState(true)
  useEffect(() => {
    // evaluate if a new deposit will exceed the pool's per-user limit
    async function calculateMaxDeposits(): Promise<void> {
      if (swapContract == null || userShareData == null || poolData == null) {
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

      setEstDepositBonus(
        tokenInputSum.gt(0)
          ? poolData.virtualPrice
              .mul(depositLPTokenAmount)
              .div(tokenInputSum)
              .sub(BigNumber.from(10).pow(18))
          : BigNumber.from(0),
      )
    }
    calculateMaxDeposits()
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
    max: parseFloat(formatUnits(tokenBalances[symbol], decimals)).toFixed(
      tokenPricesUSD ? tokenPricesUSD[symbol].toFixed(2).length - 2 : 6, // show enough token decimals to represent 0.01 USD
    ),
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

  const depositData = {
    shareOfPool: parseFloat(
      formatUnits(
        poolData?.totalLocked.gt(0)
          ? estDepositLPTokenAmount
              .mul(BigNumber.from(10).pow(18))
              .div(poolData?.totalLocked)
          : BigNumber.from(0),
        18,
      ),
    ).toFixed(2),
    lpToken: commify(
      parseFloat(formatUnits(estDepositLPTokenAmount, 18)).toFixed(5),
    ),
    deposit: BTC_POOL_TOKENS.filter(({ symbol }) =>
      BigNumber.from(tokenFormState[symbol].valueSafe).gt(0),
    ).map(({ symbol, name, icon, decimals }) => ({
      name: name,
      value: commify(formatUnits(tokenFormState[symbol].valueSafe, decimals)),
      icon: icon,
    })),
    rates:
      tokenPricesUSD != null
        ? BTC_POOL_TOKENS.filter(({ symbol }) =>
            BigNumber.from(tokenFormState[symbol].valueSafe).gt(0),
          ).map(({ symbol, name, decimals }) => ({
            name: name,
            value: commify(
              formatUnits(tokenFormState[symbol].valueSafe, decimals),
            ),
            rate: commify(tokenPricesUSD[symbol]?.toFixed(2)),
          }))
        : [],
  }

  return (
    <DepositPage
      onConfirmTransaction={onConfirmTransaction}
      onChangeTokenInputValue={updateTokenFormValue}
      title="BTC Pool"
      tokens={tokens}
      poolData={poolData}
      historicalPoolData={historicalPoolData}
      myShareData={userShareData}
      transactionInfoData={{
        bonus: estDepositBonus,
      }}
      depositDataFromParent={depositData}
      infiniteApproval={infiniteApproval}
      willExceedMaxDeposits={willExceedMaxDeposits}
      isAcceptingDeposits={!!poolData?.isAcceptingDeposits}
      hasValidMerkleState={hasValidMerkleState}
    />
  )
}
export default DepositBTC
