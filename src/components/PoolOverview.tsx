import "./PoolOverview.scss"

import React, { ReactElement } from "react"

import { Link } from "react-router-dom"
import { PoolDataType } from "../hooks/usePoolData"
import { TOKENS_MAP } from "../constants"
import classNames from "classnames"
import { formatUnits } from "@ethersproject/units"
import { useTranslation } from "react-i18next"

interface Props {
  to: string
  data: PoolDataType | null
}

function PoolOverview({ data, to }: Props): ReactElement | null {
  const { t } = useTranslation()
  if (data == null) return null
  const formattedData = {
    name: data.name,
    volume: data.volume,
    apy: data.apy,
    tokens: data.tokens.map((coin) => {
      const token = TOKENS_MAP[coin.symbol]
      return {
        symbol: token.symbol,
        name: token.name,
        icon: token.icon,
        value: parseFloat(formatUnits(coin.value, token.decimals)).toFixed(3),
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
            <div className="Apy">
              <span className="label">{t("apy")}</span>
              <span
                className={
                  classNames({ plus: formattedData.apy }) +
                  classNames({ minus: !formattedData.apy })
                }
              >
                {formattedData.apy}
              </span>
            </div>
            <div className="volume">
              <span className="label">{t("volume")}</span>
              <span>${formattedData.volume}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default PoolOverview
