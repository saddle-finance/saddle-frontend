import "./MyShareCard.scss"

import { Partners, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement } from "react"
import { formatBNToPercentString, formatBNToString } from "../utils"

import { TOKENS_MAP } from "../constants"
import { Zero } from "@ethersproject/constants"
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
    amount: commify(formatBNToString(data.underlyingTokensAmount, 18, 6)),
    amountsStaked: Object.keys(data.amountsStaked).reduce((acc, key) => {
      const value = data.amountsStaked[key as keyof typeof data.amountsStaked]
      return value
        ? {
            ...acc,
            [key]: commify(formatBNToString(value, 18, 6)),
          }
        : acc
    }, {} as typeof data.amountsStaked),
    tokens: data.tokens.map((coin) => {
      const token = TOKENS_MAP[coin.symbol]
      return {
        symbol: token.symbol,
        name: token.name,
        value: commify(formatBNToString(coin.value, 18, 6)),
      }
    }),
  }
  const stakingUrls = {
    keep: "https://dashboard.keep.network/liquidity",
    sharedStake: "https://dashboard.keep.network/liquidity",
    alchemix: "https://app.alchemix.fi/farms",
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
          <span className="value">{formattedData.amount}</span>
          {Object.keys(data.amountsStaked).map((key) => {
            return data.amountsStaked[key as Partners]?.gt(Zero) ? (
              <span className="value">
                &nbsp;
                <a
                  href={stakingUrls[key as Partners]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ({formattedData.amountsStaked[key as Partners]} {t("staked")})
                </a>
              </span>
            ) : null
          })}
        </div>
      </div>
      <div className="currency">
        {formattedData.tokens.map((coin) => (
          <div key={coin.symbol}>
            <span className="tokenName">{coin.symbol}</span>
            <span>{coin.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyShareCard
