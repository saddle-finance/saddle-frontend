import React from "react"
import "./PoolUSD.scss"

import TopMenu from "../components/TopMenu"
import PoolOverview from "../components/PoolOverview"
import MyShare from "../components/MyShare"

const poolData = {
  title: "USD Pool",
  tokens: [
    {
      name: "USDT",
      icon: require("../assets/icons/usdt.svg"),
    },
    {
      name: "DAI",
      icon: require("../assets/icons/dai.svg"),
    },
    {
      name: "USDC",
      icon: require("../assets/icons/usdc.svg"),
    },
    {
      name: "sUSD",
      icon: require("../assets/icons/susd.svg"),
    },
  ],
  APY: 1.32,
  saddAPY: "124.63% to 778.65%",
  volume: 890495.38,
}

const shareData = {
  name: "USD Pool",
  share: 0.001,
  USDbalance: 80.23,
  token: ["DAI", "USDC", "USDT", "sUSD"],
}

function PoolUSD() {
  return (
    <div className="poolUsd">
      <TopMenu activeTab={"pool"} />
      <div className="content">
        <PoolOverview data={poolData} />
        <h3>My Share</h3>
        <MyShare data={shareData} />
      </div>
    </div>
  )
}

export default PoolUSD
