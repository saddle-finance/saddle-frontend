import React from "react"

import TopMenu from "../components/TopMenu"
import MyShareCard from "../components/MyShareCard"
import PoolInfoCard from "../components/PoolInfoCard"

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
// Dumb data end here

function DepositUSD() {
  return (
    <div>
      <TopMenu activeTab={"pool"} />
      <h1>This is USD deposit page</h1>
      <MyShareCard data={testMyShareData} />
      <div style={{ height: "24px" }}></div> {/* space divider */}
      <PoolInfoCard data={testUsdPoolData} />
    </div>
  )
}

export default DepositUSD
