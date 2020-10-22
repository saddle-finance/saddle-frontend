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
      <p>{data.name}</p>
      <div className="info">
        <div className="infoItem">
          <span className="label">{t("fee")}</span>
          <span>{data.fee}%</span>
        </div>
        <div className="infoItem">
          <span className="label">{t("adminFee")}</span>
          <span>{data.adminFee}%</span>
        </div>
        <div className="infoItem">
          <span className="label">{t("virtualPrice")}</span>
          <span>{data.virtualPrice}</span>
        </div>
        <div className="infoItem">
          <span className="label">{t("dailyVolume")}</span>
          <span>{data.volume}</span>
        </div>
        <div className="infoItem">
          <span className="label">{t("liquidityUtilization")}</span>
          <span>{data.utilization}%</span>
        </div>
      </div>
      <div className="bottom">
        <p>{`${t("currencyReserves")} ${data.reserve} ${t("inTotal")}`}</p>
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
