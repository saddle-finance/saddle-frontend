import React from "react"
import "./MyShare.scss"

interface Props {
  data?: {
    name: string
    share: number
    USDbalance: number
    token: string[]
  }
}

function MyShare({ data }: Props) {
  if (!data) return null
  else
    return (
      <div className="myShare">
        <h4>My Share</h4>
        <div className="table">
          <div className="info">
            <div className="poolShare">
              <span className="label name">{data.name}</span>
              <span>{data.share}</span>
            </div>
            <div className="balance">
              <span className="label">USD Balance</span>
              <span>{data.USDbalance}</span>
            </div>
            <div className="currency">
              <span className="label">Currency</span>
              <span>{data.token.map((coin) => coin + ", ")}</span>
            </div>
          </div>
          <button className="withdraw">Withdraw</button>
        </div>
      </div>
    )
}

export default MyShare
