import "./MyShare.scss"

import React, { ReactElement } from "react"
import { formatBNToPercentString, formatBNToString } from "../utils"

import { Link } from "react-router-dom"
import { TOKENS_MAP } from "../constants"
import { UserShareType } from "../hooks/usePoolData"
import { commify } from "@ethersproject/units"
import { useTranslation } from "react-i18next"

interface Props {
  to: string
  data: UserShareType | null
}

function MyShare({ to, data }: Props): ReactElement | null {
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
        value: commify(formatBNToString(coin.value, token.decimals, 6)),
      }
    }),
  }
  return (
    <div className="myShare">
      <div className="table">
        <h4>{t("myShare") + ` (` + data.name + `)`}</h4>
        <Link to={to} className="withdraw">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 0 24 24"
            width="24"
          >
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h5c.55 0 1-.45 1-1s-.45-1-1-1H5c-1.11 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6c0-.55-.45-1-1-1s-1 .45-1 1v5c0 .55-.45 1-1 1zM14 4c0 .55.45 1 1 1h2.59l-9.13 9.13c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L19 6.41V9c0 .55.45 1 1 1s1-.45 1-1V3h-6c-.55 0-1 .45-1 1z" />
          </svg>
        </Link>
        <div className="info">
          <div className="poolShare">
            <span>
              {formattedData.share} {t("ofPool")}
            </span>
          </div>
          <div className="balance">
            <span>{`${t("usdBalance")}: ${formattedData.usdBalance}`}</span>
          </div>
          <div className="amount">
            <span>{`${t("totalAmount")}: ${formattedData.value}`}</span>
          </div>
        </div>
        <div className="divider"></div>
        <div className="currency">
          {formattedData.tokens.map((coin) => (
            <div key={coin.symbol}>
              <span className="tokenName">{coin.name}</span>
              <span>{coin.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyShare
