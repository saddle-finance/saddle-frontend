import {
  BTC_POOL_NAME,
  BTC_POOL_TOKENS,
  RENBTC,
  SBTC,
  TBTC,
  WBTC,
} from "../constants"
import React, { ReactElement, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import DepositPage from "../components/DepositPage"
import { formatSlippageToString } from "../utils/slippage"
import { formatUnits } from "@ethersproject/units"
import { useApproveAndDeposit } from "../hooks/useApproveAndDeposit"
import usePoolData from "../hooks/usePoolData"
import { useSelector } from "react-redux"
import { useTokenBalance } from "../state/wallet/hooks"
import { useTokenFormState } from "../hooks/useTokenFormState"

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
  deposit: [
    {
      name: TBTC.name,
      value: 2.2,
      icon: TBTC.icon,
    },
    {
      name: WBTC.name,
      value: 8.65,
      icon: WBTC.icon,
    },
  ],
  rates: [
    {
      name: TBTC.name,
      rate: 10902.32,
    },
    {
      name: WBTC.name,
      rate: 10910.11,
    },
  ],
  share: 0.0035,
  keepToken: 80.6942,
  slippage: 0.05,
}
// Dumb data end here

function DepositBTC(): ReactElement {
  const approveAndDeposit = useApproveAndDeposit(BTC_POOL_NAME)
  const [poolData, userShareData] = usePoolData(BTC_POOL_NAME)
  const [infiniteApproval, setInfiniteApproval] = useState(false)
  const [tokenFormState, updateTokenFormValue] = useTokenFormState(
    BTC_POOL_TOKENS,
  )
  const {
    slippageCustom,
    slippageSelected,
    gasPriceSelected,
    gasCustom,
  } = useSelector((state: AppState) => state.user)
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)

  // Account Token balances
  const tokenBalances = {
    [TBTC.symbol]: useTokenBalance(TBTC),
    [WBTC.symbol]: useTokenBalance(WBTC),
    [RENBTC.symbol]: useTokenBalance(RENBTC),
    [SBTC.symbol]: useTokenBalance(SBTC),
  }

  // A represention of tokens used for UI
  const tokens = BTC_POOL_TOKENS.map((token) => ({
    symbol: token.symbol,
    name: token.name,
    icon: token.icon,
    max: tokenBalances[token.symbol],
    inputValue: tokenFormState[token.symbol].valueRaw,
  }))

  function onConfirmTransaction(): Promise<void> {
    return approveAndDeposit({
      slippageCustom,
      slippageSelected,
      infiniteApproval,
      tokenFormState,
      gasPriceSelected,
      gasCustom,
    })
  }

  const depositData = {
    ...testDepositData,
    deposit: BTC_POOL_TOKENS.filter((t) =>
      BigNumber.from(tokenFormState[t.symbol].valueSafe).gt(0),
    ).map((t) => ({
      name: t.name,
      value: formatUnits(tokenFormState[t.symbol].valueSafe, t.decimals),
      icon: t.icon,
    })),
    rates:
      tokenPricesUSD != null
        ? BTC_POOL_TOKENS.filter((t) =>
            BigNumber.from(tokenFormState[t.symbol].valueSafe).gt(0),
          ).map((t) => ({
            name: t.name,
            value: formatUnits(tokenFormState[t.symbol].valueSafe, t.decimals),
            rate: tokenPricesUSD[t.symbol]?.toFixed(3),
          }))
        : [],
    slippage: formatSlippageToString(slippageSelected, slippageCustom),
  }

  return (
    <DepositPage
      onConfirmTransaction={onConfirmTransaction}
      onChangeTokenInputValue={updateTokenFormValue}
      onChangeInfiniteApproval={(): void =>
        setInfiniteApproval((prev) => !prev)
      }
      title="BTC Pool"
      tokens={tokens}
      poolData={poolData}
      myShareData={userShareData}
      transactionInfoData={testTransInfoData}
      depositDataFromParent={depositData}
      infiniteApproval={infiniteApproval}
    />
  )
}
export default DepositBTC
