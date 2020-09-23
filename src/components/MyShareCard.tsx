import React from "react"
import "./MyShareCard.scss"

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

function MyShareCard({ data }: Props) {
  if (!data) return null
  else
    return (
      <div className="myShareCard">
        <p>My Share: {data.share}% of pool</p>
        <span>Total value: {data.value}</span>
        <span>Balance: {data.USDbalance}USD</span>
        <span>Averaged balance: {data.aveBalance}</span>
        <div className="divider"></div> {/* divider */}
        {data.token.map((coin, index) => (
          <div className="token" key={index}>
            <span>{coin.name}</span>
            <span>{coin.value}</span>
          </div>
        ))}
      </div>
    )
}

export default MyShareCard
