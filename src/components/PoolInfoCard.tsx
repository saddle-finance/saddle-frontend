import "./PoolInfoCard.scss"

import { POOL_FEE_PRECISION, TOKENS_MAP } from "../constants"
import React, { ReactElement } from "react"
import { commify, formatUnits } from "@ethersproject/units"

import { PoolDataType } from "../hooks/usePoolData"
import { useTranslation } from "react-i18next"

interface Props {
  data: PoolDataType | null
}

function PoolInfoCard({ data }: Props): ReactElement {
  const { t } = useTranslation()
  const swapFee = data?.swapFee
    ? formatUnits(data.swapFee, POOL_FEE_PRECISION - 2)
    : null
  const adminFee = data?.adminFee
    ? formatUnits(data.adminFee, POOL_FEE_PRECISION - 2)
    : null
  const formattedData = {
    name: data?.name,
    swapFee,
    virtualPrice: data?.virtualPrice
      ? parseFloat(formatUnits(data.virtualPrice, 18)).toFixed(5)
      : null,
    reserve: data?.reserve
      ? commify(parseFloat(formatUnits(data.reserve, 18)).toFixed(3))
      : null,
    adminFee: swapFee && adminFee ? `${adminFee}% of ${swapFee}%` : null,
    volume: data?.volume,
    tokens:
      data?.tokens.map((coin) => {
        const token = TOKENS_MAP[coin.symbol]
        return {
          symbol: token.symbol,
          name: token.name,
          icon: token.icon,
          percent: coin.percent,
          value: commify(parseFloat(formatUnits(coin.value, 18)).toFixed(3)),
        }
      }) || [],
  }

  return (
    <div className="poolInfoCard">
      <h4>{formattedData.name}</h4>
      <div className="info">
        <div className="infoItem">
          <span className="label bold">{`${t("fee")}: `}</span>
          <span className="value">{formattedData.swapFee}%</span>
        </div>
        <div className="infoItem">
          <span className="label bold">{`${t("virtualPrice")}: `}</span>
          <span className="value">{formattedData.virtualPrice}</span>
        </div>
        <div className="infoItem">
          <span className="label bold">{`${t("totalLocked")}: `}</span>
          <span className="value">{`$${formattedData.reserve}`}</span>
        </div>
        <div className="twoColumn">
          <div className="infoItem">
            <span className="label bold">{`${t("adminFee")}: `}</span>
            <span className="value">{formattedData.adminFee}</span>
          </div>
          {/* <div className="infoItem">
            <span className="label bold">{t("dailyVolume") + ": "}</span>
            <span className="value">{formattedData.volume}</span>
          </div> */}
        </div>
      </div>
      <div className="divider" />
      <div className="bottom">
        <h4>{t("currencyReserves")}</h4>
        <span>{`$${formattedData.reserve} ${t("inTotal")}`}</span>
        <div className="tokenList">
          {formattedData.tokens.map((token, index) => (
            <div className="token" key={index}>
              <img alt="icon" src={token.icon} />
              <span className="bold">{`${token.name} ${token.percent} %`}</span>
              <span className="tokenValue">{token.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PoolInfoCard
