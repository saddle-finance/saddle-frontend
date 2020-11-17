import {
  DAI,
  STABLECOIN_POOL_NAME,
  STABLECOIN_POOL_TOKENS,
  SUSD,
  Token,
  USDC,
  USDT,
} from "../constants"
import React, { ReactElement, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import DepositPage from "../components/DepositPage"
import { formatSlippageToString } from "../utils/slippage"
import { formatUnits } from "@ethersproject/units"
import { useApproveAndDeposit } from "../hooks/useApproveAndDeposit"
import { useSelector } from "react-redux"
import { useTokenBalance } from "../state/wallet/hooks"
import { useTokenFormState } from "../hooks/useTokenFormState"

// Dumb data start here
const testMyShareData = {
  name: "USD Pool",
  share: 0.001,
  value: 98.56,
  USDbalance: 98.62,
  aveBalance: 98.42,
  token: [
    {
      name: DAI.name,
      value: 19.9,
    },
    {
      name: USDC.name,
      value: 30.9,
    },
    {
      name: USDT.name,
      value: 32.9,
    },
    {
      name: SUSD.name,
      value: 27.63,
    },
  ],
}

const testUsdPoolData = {
  name: "USD Pool",
  fee: 0.04,
  adminFee: 0,
  virtualPrice: 1.0224,
  utilization: 45.88,
  volume: 46555333.11,
  reserve: 142890495.38,
  tokens: [
    {
      name: DAI.name,
      icon: DAI.icon,
      percent: 12.34,
      value: 17633722.4,
    },
    {
      name: USDC.name,
      icon: USDC.icon,
      percent: 33.98,
      value: 48424123.64,
    },
    {
      name: USDT.name,
      icon: USDT.icon,
      percent: 38.96,
      value: 55675199.22,
    },
    {
      name: SUSD.name,
      icon: SUSD.icon,
      percent: 14.8,
      value: 21157478.96,
    },
  ],
}

const testTransInfoData = {
  isInfo: true,
  content: {
    minimumReceive: 0.083,
    lpTokenValue: "10.34 USD",
    benefit: 1.836,
  },
}

const depositDataFromParentTest = {
  deposit: [
    {
      name: DAI.name,
      value: 6.21,
      icon: DAI.icon,
    },
    {
      name: USDC.name,
      value: 8.65,
      icon: USDC.icon,
    },
  ],
  rates: [
    {
      name: DAI.name,
      rate: 1.02,
    },
    {
      name: USDC.name,
      rate: 0.99,
    },
  ],
  share: 0.000024,
  sadd: 0.325496,
  slippage: 0.1,
}
// Dumb data end here

function DepositUSD(): ReactElement {
  const approveAndDeposit = useApproveAndDeposit(STABLECOIN_POOL_NAME)
  const [infiniteApproval, setInfiniteApproval] = useState(false)
  const [tokenFormState, updateTokenFormValue] = useTokenFormState(
    STABLECOIN_POOL_TOKENS,
  )
  const {
    slippageCustom,
    slippageSelected,
    gasPriceSelected,
    gasCustom,
  } = useSelector((state: AppState) => state.user)
  // Account Token balances
  const tokenBalances = {
    [DAI.symbol]: useTokenBalance(DAI),
    [USDC.symbol]: useTokenBalance(USDC),
    [USDT.symbol]: useTokenBalance(USDT),
    [SUSD.symbol]: useTokenBalance(SUSD),
  }

  const tokens = STABLECOIN_POOL_TOKENS.map((token: Token) => ({
    name: token.name,
    symbol: token.symbol,
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
    ...depositDataFromParentTest,
    deposit: STABLECOIN_POOL_TOKENS.filter((t) =>
      BigNumber.from(tokenFormState[t.symbol].valueSafe).gt(0),
    ).map((t) => ({
      name: t.name,
      value: formatUnits(tokenFormState[t.symbol].valueSafe, t.decimals),
      icon: t.icon,
    })),
    slippage: formatSlippageToString(slippageSelected, slippageCustom),
  }

  return (
    <DepositPage
      onConfirmTransaction={onConfirmTransaction}
      onChangeTokenInputValue={updateTokenFormValue}
      onChangeInfiniteApproval={(): void =>
        setInfiniteApproval((prev) => !prev)
      }
      title="USD Pool"
      tokens={tokens}
      poolData={testUsdPoolData}
      transactionInfoData={testTransInfoData}
      myShareData={testMyShareData}
      depositDataFromParent={depositData}
      infiniteApproval={infiniteApproval}
    />
  )
}

export default DepositUSD
