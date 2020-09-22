import React from "react"
import "./MyShare.scss"
interface Props {
  data: any
}

function MyShare({ data }: Props) {
  return (
    <div className="myShare">
      <h4>My Share</h4>
      <div className="table">
        <div className="info">
          <div className="poolShare">
            <span>{data.name}</span>
            <span>{data.share}</span>
          </div>
          <div className="balance">
            <span>USD Balance</span>
            <span>{data.USDbalance}</span>
          </div>
          <div className="currency">
            <span>Currency</span>
            <span>{data.token}</span>
          </div>
        </div>
        <button className="withdraw">Withdraw</button>
      </div>
    </div>
  )
}

export default MyShare
