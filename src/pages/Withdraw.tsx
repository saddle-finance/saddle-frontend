import React, { ReactElement, useEffect, useMemo, useState } from "react"
import WithdrawPage, { ReviewWithdrawData } from "../components/WithdrawPage"
import {
  commify,
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
} from "@ethersproject/units"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { SwapFlashLoanNoWithdrawFee } from "../../types/ethers-contracts/SwapFlashLoanNoWithdrawFee"
import { Zero } from "@ethersproject/constants"
import { calculateGasEstimate } from "../utils/gasEstimate"
import { calculatePriceImpact } from "../utils/priceImpact"
import { formatGasToString } from "../utils/gas"
import { formatSlippageToString } from "../utils/slippage"
import { isLegacySwapABIPool } from "../constants"
import { useActiveWeb3React } from "../hooks"
import { useApproveAndWithdraw } from "../hooks/useApproveAndWithdraw"
import usePoolData from "../hooks/usePoolData"
import { useSelector } from "react-redux"
import { useSwapContract } from "../hooks/useContract"
import useWithdrawFormState from "../hooks/useWithdrawFormState"

interface Props {
  poolName: string
}
function Withdraw({ poolName }: Props): ReactElement {
  const [poolData, userShareData] = usePoolData(poolName)
  const [withdrawFormState, updateWithdrawFormState] =
    useWithdrawFormState(poolName)
  const { slippageCustom, slippageSelected, gasPriceSelected, gasCustom } =
    useSelector((state: AppState) => state.user)
  const { tokenPricesUSD, gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const approveAndWithdraw = useApproveAndWithdraw(poolName)
  const swapContract = useSwapContract(poolName)
  const { account } = useActiveWeb3React()
  const [withdrawLPTokenAmount, setWithdrawLPTokenAmount] =
    useState<BigNumber>(Zero)

  const tokenInputSum = useMemo(() => {
    return poolData.tokens.reduce(
      (sum, { address }) =>
        sum.add(
          parseEther(
            "0" +
              (withdrawFormState.tokenInputs[address]?.valueRaw.trim() || "0"),
          ) || Zero,
        ),
      Zero,
    )
  }, [poolData.tokens, withdrawFormState.tokenInputs])

  useEffect(() => {
    // evaluate if a new withdraw will exceed the pool's per-user limit
    async function calculateWithdrawBonus(): Promise<void> {
      if (
        swapContract == null ||
        userShareData == null ||
        poolData == null ||
        account == null
      ) {
        return
      }
      if (poolData.totalLocked.gt(0) && tokenInputSum.gt(0)) {
        const withdrawTokenAmounts = poolData.tokens.map(
          (token) =>
            withdrawFormState.tokenInputs[token.address]?.valueSafe || Zero,
        )
        if (isLegacySwapABIPool(poolData.name)) {
          const calculatedTokenAmount = await (
            swapContract as SwapFlashLoan
          ).calculateTokenAmount(account, withdrawTokenAmounts, false)
          setWithdrawLPTokenAmount(calculatedTokenAmount)
        } else {
          const calculatedTokenAmount = await (
            swapContract as SwapFlashLoanNoWithdrawFee
          ).calculateTokenAmount(withdrawTokenAmounts, false)
          setWithdrawLPTokenAmount(calculatedTokenAmount)
        }
      } else {
        // when pool is empty, estimate the lptokens by just summing the input instead of calling contract
        setWithdrawLPTokenAmount(tokenInputSum)
      }
    }
    void calculateWithdrawBonus()
  }, [
    poolData,
    withdrawFormState,
    swapContract,
    tokenInputSum,
    userShareData,
    account,
  ])
  async function onConfirmTransaction(): Promise<void> {
    const { withdrawType, tokenInputs, lpTokenAmountToSpend } =
      withdrawFormState
    await approveAndWithdraw({
      tokenFormState: tokenInputs,
      withdrawType,
      lpTokenAmountToSpend,
    })
    updateWithdrawFormState({ fieldName: "reset", value: "reset" })
  }

  const tokensData = React.useMemo(
    () =>
      poolData.tokens.map(({ name, symbol, address, decimals }) => ({
        name,
        symbol,
        address,
        decimals,
        priceUSD: tokenPricesUSD?.[symbol] || 0, // @dev TODO handle lpToken Price weh nwrapped withdraw implemented
        inputValue: withdrawFormState.tokenInputs[address]?.valueRaw || "",
      })),
    [withdrawFormState, poolData.tokens, tokenPricesUSD],
  )
  const gasPrice = BigNumber.from(
    formatGasToString(
      { gasStandard, gasFast, gasInstant },
      gasPriceSelected,
      gasCustom,
    ),
  )
  const gasAmount = calculateGasEstimate("removeLiquidityImbalance").mul(
    gasPrice,
  ) // units of gas * GWEI/Unit of gas

  const txnGasCost = {
    amount: gasAmount,
    valueUSD: tokenPricesUSD?.ETH
      ? parseUnits(tokenPricesUSD.ETH.toFixed(2), 18) // USD / ETH  * 10^18
          .mul(gasAmount) // GWEI
          .div(BigNumber.from(10).pow(25)) // USD / ETH * GWEI * ETH / GWEI = USD
      : null,
  }

  const reviewWithdrawData: ReviewWithdrawData = {
    withdraw: [],
    rates: [],
    slippage: formatSlippageToString(slippageSelected, slippageCustom),
    priceImpact: calculatePriceImpact(
      withdrawLPTokenAmount,
      tokenInputSum,
      poolData.virtualPrice,
      true,
    ),
    totalAmount: formatEther(tokenInputSum),
    withdrawLPTokenAmount,
    txnGasCost: txnGasCost,
  }
  console.log(reviewWithdrawData.priceImpact.toString())
  poolData.tokens.forEach(({ name, decimals, symbol, address }) => {
    if (
      BigNumber.from(
        withdrawFormState.tokenInputs[address]?.valueSafe || "0",
      ).gt(0)
    ) {
      reviewWithdrawData.withdraw.push({
        name,
        value: commify(
          formatUnits(
            withdrawFormState.tokenInputs[address]?.valueSafe || "0",
            decimals,
          ),
        ),
        symbol,
      })
      if (tokenPricesUSD != null) {
        reviewWithdrawData.rates.push({
          name,
          value: formatUnits(
            withdrawFormState.tokenInputs[address]?.valueSafe || "0",
            decimals,
          ),
          rate: commify(tokenPricesUSD[symbol]?.toFixed(2)), // TODO
        })
      }
    }
  })

  return (
    <WithdrawPage
      title={poolName}
      reviewData={reviewWithdrawData}
      tokensData={tokensData}
      poolData={poolData}
      myShareData={userShareData}
      formStateData={withdrawFormState}
      onConfirmTransaction={onConfirmTransaction}
      onFormChange={updateWithdrawFormState}
    />
  )
}

export default Withdraw
