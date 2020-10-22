import "./MyShare.scss"

import React, { ReactElement } from "react"

import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

interface Props {
  to: string
  data?: {
    name: string
    share: number
    USDbalance: number
    token: string[]
  }
}

function MyShare({ to, data }: Props): ReactElement | null {
  const { t } = useTranslation()

  if (!data) return null
  else
    return (
      <div className="myShare">
        <h4>{t("yourPoolShare")}</h4>
        <div className="table">
          <div className="info">
            <div className="poolShare">
              <span className="label name">{data.name}</span>
              <span>{data.share}</span>
            </div>
            <div className="balance">
              <span className="label">{t("usdBalance")}</span>
              <span>{data.USDbalance}</span>
            </div>
            <div className="currency">
              <span className="label">{t("currency")}</span>
              <span>{data.token.map((coin) => coin + ", ")}</span>
            </div>
          </div>
          <Link to={to}>
            <button className="withdraw">{t("withdraw")}</button>
          </Link>
        </div>
      </div>
    )
}

export default MyShare
