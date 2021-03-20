import "./PoolOverview.scss"

import { PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement } from "react"
import { formatBNToPercentString, formatBNToString } from "../utils"

import { Link } from "react-router-dom"
import { TOKENS_MAP } from "../constants"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import { commify } from "@ethersproject/units"
import { useTranslation } from "react-i18next"

interface Props {
  to: string
  poolData: PoolDataType | null
  userShareData: UserShareType | null
}

function PoolOverview({
  poolData,
  to,
  userShareData,
}: Props): ReactElement | null {
  const { t } = useTranslation()
  if (poolData == null) return null
  const formattedData = {
    name: poolData.name,
    reserve: `$${commify(formatBNToString(poolData.reserve, 18, 2))}`,
    apr: formatBNToPercentString(poolData.keepApr || Zero, 18),
    userBalanceUSD: `$${commify(
      formatBNToString(userShareData?.usdBalance || Zero, 18, 2),
    )}`,
    tokens: poolData.tokens.map((coin) => {
      const token = TOKENS_MAP[coin.symbol]
      return {
        symbol: token.symbol,
        name: token.name,
        icon: token.icon,
        value: formatBNToString(coin.value, token.decimals, 4),
      }
    }),
  }

  return (
    <div className="poolOverview">
      <Link to={to}>
        <div className="table">
          <h4 className="title">{formattedData.name}</h4>
          <div className="left">
            <span style={{ marginRight: "8px" }}>[</span>
            {formattedData.tokens.map((token) => (
              <div className="token" key={token.symbol}>
                <img alt="icon" src={token.icon} />
                <span>{token.name}</span>
              </div>
            ))}
            <span style={{ marginLeft: "-8px" }}>]</span>
          </div>

          <div className="right">
            {poolData.keepApr.gt(Zero) && (
              <div className="Apr">
                <span className="label">KEEP APR</span>
                <span
                  className={
                    classNames({ plus: formattedData.apr }) +
                    classNames({ minus: !formattedData.apr })
                  }
                >
                  {formattedData.apr}
                </span>
              </div>
            )}
            <div className="volume">
              <span className="label">{t("currencyReserves")}</span>
              <span>{formattedData.reserve}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default PoolOverview
