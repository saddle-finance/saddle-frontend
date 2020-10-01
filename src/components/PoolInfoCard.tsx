import "./PoolInfoCard.scss"

import React, { ReactElement } from "react"

interface Props {
  data: {
    name: string
    fee: number
    adminFee: number
    virtualPrice: number
    utilization: number
    volume: number
    reserve: number
    tokens: Array<{
      name: string
      icon: string
      percent: number
      value: number
    }>
  }
}

function PoolInfoCard({ data }: Props): ReactElement {
  return (
    <div className="poolInfoCard">
      <p>{data.name}</p>
      <div className="info">
        <div className="infoItem">
          <span className="label">Fee</span>
          <span>{data.fee}%</span>
        </div>
        <div className="infoItem">
          <span className="label">Admin fee</span>
          <span>{data.adminFee}%</span>
        </div>
        <div className="infoItem">
          <span className="label">Virtual price</span>
          <span>{data.virtualPrice}</span>
        </div>
        <div className="infoItem">
          <span className="label">Daily volume</span>
          <span>{data.volume}</span>
        </div>
        <div className="infoItem">
          <span className="label">Liquidity utilization</span>
          <span>{data.utilization}%</span>
        </div>
      </div>
      <div className="bottom">
        <p>Curreny reserves {data.reserve} in total</p>
        <div className="tokenList">
          {data.tokens.map((token, index) => (
            <div className="token" key={index}>
              <img alt="" src={token.icon} />
              <span>{token.name}</span>
              <span className="tokenPercent">{token.percent}%</span>
              <span className="tokenValue">{token.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PoolInfoCard
