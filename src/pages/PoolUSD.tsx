import "./PoolUSD_BTC.scss"

import React, { ReactElement } from "react"

import MyShare from "../components/MyShare"
import PoolOverview from "../components/PoolOverview"
import { STABLECOIN_POOL_NAME } from "../constants"
import TopMenu from "../components/TopMenu"
import usePoolData from "../hooks/usePoolData"

function PoolUSD(): ReactElement {
  const [poolData, userShareData] = usePoolData(STABLECOIN_POOL_NAME)
  return (
    <div className="poolUsd">
      <TopMenu activeTab={"pool"} />
      <div className="content">
        <PoolOverview data={poolData} to="/pool/usd/deposit" />
        <div style={{ height: "40px" }}></div> {/* space divider */}
        {userShareData && (
          <MyShare data={userShareData} to="/pool/usd/withdraw" />
        )}
      </div>
    </div>
  )
}

export default PoolUSD
