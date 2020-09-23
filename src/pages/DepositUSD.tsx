import React from "react"

import TopMenu from "../components/TopMenu"
import MyShareCard from "../components/MyShareCard"

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

function DepositUSD() {
  return (
    <div>
      <TopMenu activeTab={"pool"} />
      <h1>This is USD deposit page</h1>
      <MyShareCard data={testMyShareData} />
    </div>
  )
}

export default DepositUSD
