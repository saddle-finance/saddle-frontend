import "./PoolUSD_BTC.scss"

import MyShare from "../components/MyShare"
import PoolOverview from "../components/PoolOverview"
import React from "react"
import TopMenu from "../components/TopMenu"
<<<<<<< HEAD
=======
import renbtcLogo from "../assets/icons/renbtc.svg"
import sbtcLogo from "../assets/icons/sbtc.svg"
import tbtcLogo from "../assets/icons/tbtc.svg"
import wbtcLogo from "../assets/icons/wbtc.svg"
>>>>>>> Enable eslint:recommended linting rules and fix errors

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
