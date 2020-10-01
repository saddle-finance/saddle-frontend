import DepositPage from "../components/DepositPage"
import React from "react"

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
      icon: require("../assets/icons/dai.svg"),
      percent: 12.34,
      value: 17633722.4,
    },
    {
      name: "USDC",
      icon: require("../assets/icons/usdc.svg"),
      percent: 33.98,
      value: 48424123.64,
    },
    {
      name: "USDT",
      icon: require("../assets/icons/usdt.svg"),
      percent: 38.96,
      value: 55675199.22,
    },
    {
      name: "sUSD",
      icon: require("../assets/icons/susd.svg"),
      percent: 14.8,
      value: 21157478.96,
    },
  ],
}

const testTokensData = [
  {
    name: "DAI",
    icon: require("../assets/icons/dai.svg"),
    max: 7.02,
  },
  {
    name: "USDC",
    icon: require("../assets/icons/usdc.svg"),
    max: 1.01,
  },
  {
    name: "USDT",
    icon: require("../assets/icons/usdt.svg"),
    max: 0,
  },
  {
    name: "sUSD",
    icon: require("../assets/icons/susd.svg"),
    max: 0,
  },
]

const selected = {
  maxSlippage: 0.1,
  gas: "standard",
}

const testTransInfoData = {
  isInfo: true,
  content: {
    minimumReceive: 0.083,
    lpTokenValue: "10.34 USD",
    benefit: 1.836,
  },
}

const testDepositData = {
  deposit: [
    {
      name: "DAI",
      value: 6.21,
      icon: require("../assets/icons/dai.svg"),
    },
    {
      name: "USDC",
      value: 8.65,
      icon: require("../assets/icons/usdc.svg"),
    },
  ],
  rates: [
    {
      name: "DAI",
      rate: 1.02,
    },
    {
      name: "USDC",
      rate: 0.99,
    },
  ],
  share: 0.000024,
  sadd: 0.325496,
}
// Dumb data end here

function DepositUSD() {
  return (
    <DepositPage
      title="USD Pool"
      tokensData={testTokensData}
      selected={selected}
      poolData={testUsdPoolData}
      transactionInfoData={testTransInfoData}
      myShareData={testMyShareData}
      depositDataFromParent={testDepositData}
    />
  )
}

export default DepositUSD
