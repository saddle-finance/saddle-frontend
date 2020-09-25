import React from "react"
import DepositPage from "../components/DepositPage"

// Dumb data start here
const testBTCPoolData = {
  name: "BTC Pool",
  fee: 0.04,
  adminFee: 0,
  virtualPrice: 1.0224,
  utilization: 64.02,
  volume: 46555333.11,
  reserve: 142890495.38,
  tokens: [
    {
      name: "tBTC",
      icon: require("../assets/icons/tbtc.svg"),
      percent: 12.34,
      value: 17633722.4,
    },
    {
      name: "wBTC",
      icon: require("../assets/icons/wbtc.svg"),
      percent: 33.98,
      value: 48424123.64,
    },
    {
      name: "renBTC",
      icon: require("../assets/icons/renbtc.svg"),
      percent: 38.96,
      value: 55675199.22,
    },
    {
      name: "sBTC",
      icon: require("../assets/icons/sbtc.svg"),
      percent: 14.8,
      value: 21157478.96,
    },
  ],
}

const testTokensData = [
  {
    name: "tBTC",
    icon: require("../assets/icons/tbtc.svg"),
    max: 2.02,
  },
  {
    name: "wBTC",
    icon: require("../assets/icons/wbtc.svg"),
    max: 1.31,
  },
  {
    name: "renBTC",
    icon: require("../assets/icons/renbtc.svg"),
    max: 0.1,
  },
  {
    name: "sBTC",
    icon: require("../assets/icons/sbtc.svg"),
    max: 0.2,
  },
]

const selected = {
  maxSlippage: 0.1,
  gas: "standard",
  infiniteApproval: false,
}

const testTransInfoData = {
  isInfo: false,
  content: {
    minimumReceive: 0.083,
    lpTokenValue: "10.34 USD",
    benefit: 1.836,
  },
}
// Dumb data end here

function DepositBTC() {
  return (
    <DepositPage
      tokensData={testTokensData}
      selected={selected}
      poolData={testBTCPoolData}
      transactionInfoData={testTransInfoData}
    />
  )
}
export default DepositBTC
