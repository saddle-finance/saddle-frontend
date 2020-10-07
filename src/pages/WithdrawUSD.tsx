import React, { ReactElement } from "react"

import WithdrawPage from "../components/WithdrawPage"

import daiLogo from "../assets/icons/dai.svg"
import susdLogo from "../assets/icons/susd.svg"
import usdcLogo from "../assets/icons/usdc.svg"
import usdtLogo from "../assets/icons/usdt.svg"
// Dumb data start here
const testMyShareData = {
  name: "USD Pool",
  share: 0.001,
  value: 98.56,
  USDbalance: 98.62,
  aveBalance: 98.42,
  token: [
    {
      name: "DAI",
      value: 19.9,
    },
    {
      name: "USDC",
      value: 30.9,
    },
    {
      name: "USDT",
      value: 32.9,
    },
    {
      name: "sUSD",
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
      name: "DAI",
      icon: daiLogo,
      percent: 12.34,
      value: 17633722.4,
    },
    {
      name: "USDC",
      icon: usdcLogo,
      percent: 33.98,
      value: 48424123.64,
    },
    {
      name: "USDT",
      icon: usdtLogo,
      percent: 38.96,
      value: 55675199.22,
    },
    {
      name: "sUSD",
      icon: susdLogo,
      percent: 14.8,
      value: 21157478.96,
    },
  ],
}

const testTokensData = [
  {
    name: "DAI",
    icon: daiLogo,
    max: 7.02,
  },
  {
    name: "USDC",
    icon: usdcLogo,
    max: 1.01,
  },
  {
    name: "USDT",
    icon: usdtLogo,
    max: 0,
  },
  {
    name: "sUSD",
    icon: susdLogo,
    max: 0,
  },
]

const testTransInfoData = {
  isInfo: false,
  content: {
    minimumReceive: 0.083,
    lpTokenValue: "10.34 USD",
    benefit: 1.836,
  },
}
// Dumb data end here

function WithdrawUSD(): ReactElement {
  return (
    <WithdrawPage
      title="USD Pool"
      tokensData={testTokensData}
      poolData={testUsdPoolData}
      transactionInfoData={testTransInfoData}
      myShareData={testMyShareData}
    />
  )
}

export default WithdrawUSD
