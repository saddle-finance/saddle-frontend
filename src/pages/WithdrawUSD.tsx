import { DAI, SUSD, USDC, USDT } from "../constants"
import React, { ReactElement } from "react"

import WithdrawPage from "../components/WithdrawPage"

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
      symbol: DAI.symbol,
      percent: 12.34,
      value: 17633722.4,
    },
    {
      name: USDC.name,
      icon: USDC.icon,
      symbol: USDC.symbol,
      percent: 33.98,
      value: 48424123.64,
    },
    {
      name: USDT.name,
      icon: USDT.icon,
      symbol: USDT.symbol,
      percent: 38.96,
      value: 55675199.22,
    },
    {
      name: SUSD.name,
      icon: SUSD.icon,
      symbol: SUSD.symbol,
      percent: 14.8,
      value: 21157478.96,
    },
  ],
}

const testTokensData = [
  {
    name: DAI.name,
    icon: DAI.icon,
    symbol: DAI.symbol,
    max: 7.02,
    inputValue: 0,
  },
  {
    name: USDC.name,
    icon: USDC.icon,
    symbol: USDC.symbol,
    max: 1.01,
    inputValue: 0,
  },
  {
    name: USDT.name,
    icon: USDT.icon,
    symbol: USDT.symbol,
    max: 0,
    inputValue: 0,
  },
  {
    name: SUSD.name,
    icon: SUSD.icon,
    symbol: SUSD.symbol,
    max: 0,
    inputValue: 0,
  },
]

const testTransInfoData = {
  isInfo: false,
  content: {
    lpTokenValue: "10.34 USD",
    benefit: 1.836,
  },
}
// Dumb data end here

function WithdrawUSD(): ReactElement {
  return (
    <WithdrawPage
      onChangeTokenInputValue={(): void => undefined}
      title="USD Pool"
      tokensData={testTokensData}
      poolData={testUsdPoolData}
      transactionInfoData={testTransInfoData}
      myShareData={testMyShareData}
    />
  )
}

export default WithdrawUSD
