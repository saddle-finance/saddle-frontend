import "./PoolUSD_BTC.scss"

import MyShare from "../components/MyShare"
import PoolOverview from "../components/PoolOverview"
import React from "react"
import TopMenu from "../components/TopMenu"

// Dumb data start here
const poolData = {
  title: "BTC Pool",
  tokens: [
    {
      name: "tBTC",
      icon: require("../assets/icons/tbtc.svg"),
    },
    {
      name: "wBTC",
      icon: require("../assets/icons/wbtc.svg"),
    },
    {
      name: "renBTC",
      icon: require("../assets/icons/renbtc.svg"),
    },
    {
      name: "sBTC",
      icon: require("../assets/icons/sbtc.svg"),
    },
  ],
  APY: 2.68,
  saddAPY: "160.63% to 433.65%",
  volume: 80495.38,
}
// Dumb data end here

function PoolBTC() {
  return (
    <div className="poolBtc">
      <TopMenu activeTab={"pool"} />
      <div className="content">
        <PoolOverview data={poolData} to="/pool/btc/deposit" />
        <MyShare />
      </div>
    </div>
  )
}

export default PoolBTC
