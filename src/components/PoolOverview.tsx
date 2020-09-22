import React from "react"

import "./PoolOverview.scss"

interface Props {
  data: {
    title: string
    tokens: Array<{ name: string; icon: string }>
    APY: number
    saddAPY: string
    volume: number
  }
}

function PoolOverview({ data }: Props) {
  return (
    <div className="poolOverview">
      <h4>Pool Overview</h4>
      <div className="table">
        <span>{data.title}</span>

        <span>[</span>
        {data.tokens.map((token, index) => (
          <div key={index}>
            <img alt="" src={token.icon} />
            <span>{token.name}</span>
          </div>
        ))}
        {/* <img alt="" src={data.token[0].icon}></img>
    <span>{data.token[0].name}</span> */}
        <span>]</span>

        <div className="Apy">
          <span>APY</span>
          <span>{data.APY}</span>
        </div>
        <div className="saddApy">
          <span>SADD APY</span>
          <span>{data.saddAPY}</span>
        </div>
        <div className="volume">
          <span>Volume</span>
          <span>{data.volume}</span>
        </div>
      </div>
    </div>
  )
}

export default PoolOverview
