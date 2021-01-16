import {
  BTC_POOL_NAME,
  BTC_POOL_TOKENS,
  RENBTC,
  SBTC,
  TBTC,
  WBTC,
} from "../constants"
import React, { ReactElement, useEffect, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import DepositPage from "../components/DepositPage"
import { formatUnits } from "@ethersproject/units"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "../hooks"
import { useApproveAndDeposit } from "../hooks/useApproveAndDeposit"
import usePoolData from "../hooks/usePoolData"
import { useSelector } from "react-redux"
import { useSwapContract } from "../hooks/useContract"
import { useTokenBalance } from "../state/wallet/hooks"
import { useTokenFormState } from "../hooks/useTokenFormState"
import { useUserMerkleProof } from "../hooks/useUserMerkleProof"

// Dumb data start here
const testTransInfoData = {
  isInfo: false,
  content: {
    minimumReceive: 0.083,
    keepTokenValue: "1.34 USD",
    benefit: 1.836,
  },
}

const testDepositData = {
  share: 0.0035,
  lpToken: 80.6942,
}
// Dumb data end here

function DepositBTC(): ReactElement | null {
  const { account } = useActiveWeb3React()
  const { userMerkleProof, hasValidMerkleState } = useUserMerkleProof(
    BTC_POOL_NAME,
  )
  const approveAndDeposit = useApproveAndDeposit(BTC_POOL_NAME)
  const [poolData, userShareData] = usePoolData(BTC_POOL_NAME)
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
  const [willExceedMaxDeposits, setWillExceedMaxDeposit] = useState(true)
  useEffect(() => {
    // evaluate if a new deposit will exceed the pool's per-user limit
    async function calculateMaxDeposits(): Promise<void> {
      if (swapContract == null || userShareData == null || poolData == null)
        return
      const tokenInputSum = parseUnits(
        String(
          BTC_POOL_TOKENS.reduce(
            (sum, { symbol }) => sum + (+tokenFormState[symbol].valueRaw || 0),
            0,
          ),
        ),
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

      const futureUserLPTokenBalance = depositLPTokenAmount.add(
        userShareData?.lpTokenBalance,
      )
      const exceedsMaxDeposits = futureUserLPTokenBalance.gt(
        poolData.poolAccountLimit,
      )
      if (willExceedMaxDeposits !== exceedsMaxDeposits) {
        setWillExceedMaxDeposit(exceedsMaxDeposits)
      }
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
    ...testDepositData,
    deposit: BTC_POOL_TOKENS.filter(({ symbol }) =>
      BigNumber.from(tokenFormState[symbol].valueSafe).gt(0),
    ).map(({ symbol, name, icon, decimals }) => ({
      name: name,
      value: formatUnits(tokenFormState[symbol].valueSafe, decimals),
      icon: icon,
    })),
    rates:
      tokenPricesUSD != null
        ? BTC_POOL_TOKENS.filter(({ symbol }) =>
            BigNumber.from(tokenFormState[symbol].valueSafe).gt(0),
          ).map(({ symbol, name, decimals }) => ({
            name: name,
            value: formatUnits(tokenFormState[symbol].valueSafe, decimals),
            rate: tokenPricesUSD[symbol]?.toFixed(2),
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
      myShareData={userShareData}
      transactionInfoData={testTransInfoData}
      depositDataFromParent={depositData}
      infiniteApproval={infiniteApproval}
      willExceedMaxDeposits={willExceedMaxDeposits}
      isAcceptingDeposits={!!poolData?.isAcceptingDeposits}
      hasValidMerkleState={hasValidMerkleState}
    />
  )
}
export default DepositBTC
