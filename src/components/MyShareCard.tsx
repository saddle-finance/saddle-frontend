import "./MyShareCard.scss"

import React, { ReactElement } from "react"

interface Props {
  data?: {
    name: string
    share: number
    value: number
    USDbalance: number
    aveBalance: number
    token: Array<{ name: string; value: number }>
  }
}

function MyShareCard({ data }: Props): ReactElement | null {
  if (!data) return null
  else
    return (
      <div className="myShareCard">
        <p>My Share: {data.share}% of pool</p>
        <div className="info">
          <span>Total value: {data.value}</span>
          <span>Balance: {data.USDbalance}USD</span>
          <span>Averaged balance: {data.aveBalance}</span>
        </div>
        <div className="divider"></div> {/* divider */}
        <div className="tokenList">
          {data.token.map((coin, index) => (
            <div className="token" key={index}>
              <span className="tokenName">{coin.name}</span>
              <span>{coin.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
}

export default MyShareCard
