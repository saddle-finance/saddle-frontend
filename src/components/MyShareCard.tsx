import "./MyShareCard.scss"

import React, { ReactElement } from "react"

import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation()

  if (!data) return null
  else
    return (
      <div className="myShareCard">
        <h4>{t("myShare")}</h4>
        <div className="info">
          <div className="poolShare">
            <span>{data.share} of pool</span>
          </div>
          <div className="balance">
            <span>{t("usdBalance") + ": " + data.USDbalance}</span>
          </div>
          <div className="amount">
            <span>Total amount: {data.value}</span>
          </div>
        </div>
        <div className="currency">
          {data.token.map((coin, index) => (
            <div key={index}>
              <span className="tokenName">{coin.name}</span>
              <span>{coin.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
}

export default MyShareCard
