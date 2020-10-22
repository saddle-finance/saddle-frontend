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
        <p>{`${t("yourPoolShare")}: ${data.share}`}</p>
        <div className="info">
          <span>{`${t("totalValue")}: ${data.value}`}</span>
          <span>{`${t("balance")}: ${data.USDbalance} USD`}</span>
          <span>{`${t("averagedBalance")}: ${data.aveBalance}`}</span>
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
