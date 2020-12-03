import "./PoolUSD_BTC.scss"

import React, { ReactElement } from "react"

import { BTC_POOL_NAME } from "../constants"
import MyShare from "../components/MyShare"
import PoolOverview from "../components/PoolOverview"
import TopMenu from "../components/TopMenu"
import usePoolData from "../hooks/usePoolData"

function PoolBTC(): ReactElement {
  const [poolData, userShareData] = usePoolData(BTC_POOL_NAME)
  return (
    <div className="poolUsd">
      <TopMenu activeTab={"pool"} />
      <div className="content">
        <PoolOverview data={poolData} to="/pool/btc/deposit" />
        <div style={{ height: "40px" }}></div> {/* space divider */}
        {userShareData && (
          <MyShare data={userShareData} to="/pool/btc/withdraw" />
        )}
      </div>
    </div>
  )
}

export default PoolBTC
