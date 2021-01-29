import "./MyShareCard.scss"

import React, { ReactElement } from "react"
import { formatBNToPercentString, formatBNToString } from "../utils"

import { TOKENS_MAP } from "../constants"
import { UserShareType } from "../hooks/usePoolData"
import { commify } from "@ethersproject/units"
import { useTranslation } from "react-i18next"

interface Props {
  data: UserShareType | null
}

function MyShareCard({ data }: Props): ReactElement | null {
  const { t } = useTranslation()

  if (!data) return null

  const formattedData = {
    share: formatBNToPercentString(data.share, 18),
    usdBalance: commify(formatBNToString(data.usdBalance, 18, 2)),
    value: commify(formatBNToString(data.value, 18, 6)),
    tokens: data.tokens.map((coin) => {
      const token = TOKENS_MAP[coin.symbol]
      return {
        symbol: token.symbol,
        name: token.name,
        value: commify(formatBNToString(coin.value, 18, 6)),
      }
    }),
  }

  return (
    <div className="myShareCard">
      <h4>{t("myShare")}</h4>
      <div className="info">
        <div className="poolShare">
          <span>
            {formattedData.share} {t("ofPool")}
          </span>
        </div>
        <div className="infoItem">
          <span className="label bold">{`${t("usdBalance")}: `}</span>
          <span className="value">{`$${formattedData.usdBalance}`}</span>
        </div>
        <div className="infoItem">
          <span className="label bold">{`${t("totalAmount")}: `}</span>
          <span className="value">{formattedData.value}</span>
        </div>
      </div>
      <div className="currency">
        {formattedData.tokens.map((coin) => (
          <div key={coin.symbol}>
            <span className="tokenName">{coin.name}</span>
            <span>{coin.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyShareCard
