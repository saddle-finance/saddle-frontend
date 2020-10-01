import "./PoolUSD_BTC.scss"

import MyShare from "../components/MyShare"
import PoolOverview from "../components/PoolOverview"
import React from "react"
import TopMenu from "../components/TopMenu"
<<<<<<< HEAD
=======
import daiLogo from "../assets/icons/dai.svg"
import susdLogo from "../assets/icons/susd.svg"
import usdcLogo from "../assets/icons/usdc.svg"
import usdtLogo from "../assets/icons/usdt.svg"
>>>>>>> Enable eslint:recommended linting rules and fix errors

const poolData = {
  title: "USD Pool",
  tokens: [
    {
      name: "USDT",
      icon: usdtLogo,
    },
    {
      name: "DAI",
      icon: daiLogo,
    },
    {
      name: "USDC",
      icon: usdcLogo,
    },
    {
      name: "sUSD",
      icon: susdLogo,
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
        <PoolOverview data={poolData} to="/pool/usd/deposit" />
        <div style={{ height: "40px" }}></div> {/* space divider */}
        <MyShare data={shareData} />
      </div>
    </div>
  )
}

export default PoolUSD
