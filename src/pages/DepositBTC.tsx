import React, { ReactElement } from "react"

import DepositPage from "../components/DepositPage"
import renbtcLogo from "../assets/icons/renbtc.svg"
import sbtcLogo from "../assets/icons/sbtc.svg"
import tbtcLogo from "../assets/icons/tbtc.svg"
import wbtcLogo from "../assets/icons/wbtc.svg"

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
      icon: tbtcLogo,
      percent: 12.34,
      value: 17633722.4,
    },
    {
      name: "wBTC",
      icon: wbtcLogo,
      percent: 33.98,
      value: 48424123.64,
    },
    {
      name: "renBTC",
      icon: renbtcLogo,
      percent: 38.96,
      value: 55675199.22,
    },
    {
      name: "sBTC",
      icon: sbtcLogo,
      percent: 14.8,
      value: 21157478.96,
    },
  ],
}

const testTokensData = [
  {
    name: "tBTC",
    icon: tbtcLogo,
    max: 2.02,
  },
  {
    name: "wBTC",
    icon: wbtcLogo,
    max: 1.31,
  },
  {
    name: "renBTC",
    icon: renbtcLogo,
    max: 0.1,
  },
  {
    name: "sBTC",
    icon: sbtcLogo,
    max: 0.2,
  },
]

const selected = {
  maxSlippage: 0.1,
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

const testDepositData = {
  deposit: [
    {
      name: "tBTC",
      value: 2.2,
      icon: tbtcLogo,
    },
    {
      name: "wBTC",
      value: 8.65,
      icon: wbtcLogo,
    },
  ],
  rates: [
    {
      name: "tBTC",
      rate: 10902.32,
    },
    {
      name: "wBTC",
      rate: 10910.11,
    },
  ],
  share: 0.0035,
  sadd: 80.6942,
}
// Dumb data end here

function DepositBTC(): ReactElement {
  return (
    <DepositPage
      title="BTC Pool"
      tokensData={testTokensData}
      selected={selected}
      poolData={testBTCPoolData}
      transactionInfoData={testTransInfoData}
      depositDataFromParent={testDepositData}
    />
  )
}
export default DepositBTC
