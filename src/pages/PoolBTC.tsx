import "./PoolUSD_BTC.scss"

import React, { ReactElement } from "react"

import MyShare from "../components/MyShare"
import PoolOverview from "../components/PoolOverview"
import TopMenu from "../components/TopMenu"
import renbtcLogo from "../assets/icons/renbtc.svg"
import sbtcLogo from "../assets/icons/sbtc.svg"
import tbtcLogo from "../assets/icons/tbtc.svg"
import wbtcLogo from "../assets/icons/wbtc.svg"

// Dumb data start here
const poolData = {
  title: "BTC Pool",
  tokens: [
    {
      name: "tBTC",
      icon: tbtcLogo,
    },
    {
      name: "wBTC",
      icon: wbtcLogo,
    },
    {
      name: "renBTC",
      icon: renbtcLogo,
    },
    {
      name: "sBTC",
      icon: sbtcLogo,
    },
  ],
  APY: 2.68,
  saddAPY: "160.63% to 433.65%",
  volume: 80495.38,
}

const shareData = {
  name: "USD Pool",
  share: 0,
  amount: 0,
  USDbalance: 0,
  token: ["tBTC", "wBTC", "renBTC", "sBTC"],
}
// Dumb data end here

function PoolBTC(): ReactElement {
  return (
    <div className="poolBtc">
      <TopMenu activeTab={"pool"} />
      <div className="content">
        <PoolOverview data={poolData} to="/pool/btc/deposit" />
        {shareData.share ? <MyShare to="/pool/btc/withdraw" /> : null}
      </div>
    </div>
  )
}

export default PoolBTC
