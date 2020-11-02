import "./PoolInfoCard.scss"

import React, { ReactElement } from "react"

import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation()

  return (
    <div className="poolInfoCard">
      <h4>{data.name}</h4>
      <div className="info">
        <div className="infoItem">
          <span className="label">{t("fee") + ": "}</span>
          <span className="value">{data.fee}%</span>
        </div>
        <div className="infoItem">
          <span className="label">{t("virtualPrice") + ": "}</span>
          <span className="value">{data.virtualPrice}</span>
        </div>
        <div className="infoItem">
          <span className="label">{t("totalLocked") + " ($): "}</span>
          <span className="value">{data.reserve}</span>
        </div>
        <div className="twoColumn">
          <div className="infoItem">
            <span className="label">{t("adminFee") + ": "}</span>
            <span className="value">{data.adminFee}%</span>
          </div>
          <div className="infoItem">
            <span className="label">{t("dailyVolume") + ": "}</span>
            <span className="value">{data.volume}</span>
          </div>
        </div>
      </div>
      <div className="divider" />
      <div className="bottom">
        <h4>{t("currencyReserves")}</h4>
        <span>{`$${data.reserve} ${t("inTotal")}`}</span>
        <div className="tokenList">
          {data.tokens.map((token, index) => (
            <div className="token" key={index}>
              <img alt="icon" src={token.icon} />
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
