import { BTC_POOL_NAME, BTC_POOL_TOKENS } from "../constants"
import React, { ReactElement, useEffect, useState } from "react"
import WithdrawPage, { ReviewWithdrawData } from "../components/WithdrawPage"
import { commify, formatUnits, parseUnits } from "@ethersproject/units"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { formatSlippageToString } from "../utils/slippage"
import { useActiveWeb3React } from "../hooks"
import { useApproveAndWithdraw } from "../hooks/useApproveAndWithdraw"
import useHistoricalPoolData from "../hooks/useHistoricalPoolData"
import usePoolData from "../hooks/usePoolData"
import { useSelector } from "react-redux"
import { useSwapContract } from "../hooks/useContract"
import useWithdrawFormState from "../hooks/useWithdrawFormState"

function WithdrawBTC(): ReactElement {
  const [poolData, userShareData] = usePoolData(BTC_POOL_NAME)
  const historicalPoolData = useHistoricalPoolData(BTC_POOL_NAME)
  const [withdrawFormState, updateWithdrawFormState] = useWithdrawFormState(
    BTC_POOL_NAME,
  )
  const { slippageCustom, slippageSelected, infiniteApproval } = useSelector(
    (state: AppState) => state.user,
  )
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  const approveAndWithdraw = useApproveAndWithdraw(BTC_POOL_NAME)
  const swapContract = useSwapContract(BTC_POOL_NAME)
  const { account } = useActiveWeb3React()

  const [estWithdrawBonus, setEstWithdrawBonus] = useState(BigNumber.from(0))
  useEffect(() => {
    // evaluate if a new withdraw will exceed the pool's per-user limit
    async function calculateWithdrawBonus(): Promise<void> {
      if (swapContract == null || userShareData == null || poolData == null) {
        return
      }
      const tokenInputSum = parseUnits(
        BTC_POOL_TOKENS.reduce(
          (sum, { symbol }) =>
            sum + (+withdrawFormState.tokenInputs[symbol].valueRaw || 0),
          0,
        ).toFixed(18),
        18,
      )
      let withdrawLPTokenAmount
      if (poolData.totalLocked.gt(0) && tokenInputSum.gt(0)) {
        withdrawLPTokenAmount = await swapContract.calculateTokenAmount(
          account,
          BTC_POOL_TOKENS.map(
            ({ symbol }) => withdrawFormState.tokenInputs[symbol].valueSafe,
          ),
          false,
        )
      } else {
        // when pool is empty, estimate the lptokens by just summing the input instead of calling contract
        withdrawLPTokenAmount = tokenInputSum
      }
      setEstWithdrawBonus(
        tokenInputSum.gt(0)
          ? tokenInputSum
              .mul(BigNumber.from(10).pow(36))
              .div(poolData.virtualPrice.mul(withdrawLPTokenAmount))
              .sub(BigNumber.from(10).pow(18))
          : BigNumber.from(0),
      )
    }
    calculateWithdrawBonus()
  }, [poolData, withdrawFormState, swapContract, userShareData, account])
  async function onConfirmTransaction(): Promise<void> {
    const {
      withdrawType,
      tokenInputs,
      lpTokenAmountToSpend,
    } = withdrawFormState
    await approveAndWithdraw({
      tokenFormState: tokenInputs,
      infiniteApproval,
      withdrawType,
      lpTokenAmountToSpend,
    })
    updateWithdrawFormState({ fieldName: "reset", value: "reset" })
  }

  const tokensData = React.useMemo(
    () =>
      BTC_POOL_TOKENS.map(({ name, symbol, icon }) => ({
        name,
        symbol,
        icon,
        inputValue: withdrawFormState.tokenInputs[symbol].valueRaw,
      })),
    [withdrawFormState],
  )

  const reviewWithdrawData: ReviewWithdrawData = {
    withdraw: [],
    rates: [],
    slippage: formatSlippageToString(slippageSelected, slippageCustom),
    bonus: estWithdrawBonus,
  }
  BTC_POOL_TOKENS.forEach(({ name, decimals, icon, symbol }) => {
    if (BigNumber.from(withdrawFormState.tokenInputs[symbol].valueSafe).gt(0)) {
      reviewWithdrawData.withdraw.push({
        name,
        value: commify(
          formatUnits(
            withdrawFormState.tokenInputs[symbol].valueSafe,
            decimals,
          ),
        ),
        icon,
      })
      if (tokenPricesUSD != null) {
        reviewWithdrawData.rates.push({
          name,
          value: formatUnits(
            withdrawFormState.tokenInputs[symbol].valueSafe,
            decimals,
          ),
          rate: commify(tokenPricesUSD[symbol]?.toFixed(2)),
        })
      }
    }
  })

  return (
    <WithdrawPage
      title="BTC Pool"
      reviewData={reviewWithdrawData}
      tokensData={tokensData}
      poolData={poolData}
      historicalPoolData={historicalPoolData}
      myShareData={userShareData}
      formStateData={withdrawFormState}
      onConfirmTransaction={onConfirmTransaction}
      onFormChange={updateWithdrawFormState}
    />
  )
}

export default WithdrawBTC
