import "./PoolInfoCard.scss"

import {
  POOLS_MAP,
  POOL_FEE_PRECISION,
  PoolTypes,
  TOKENS_MAP,
} from "../constants"
import React, { ReactElement } from "react"
import { formatBNToPercentString, formatBNToString } from "../utils"
import { Divider } from "@mui/material"
import { PoolDataType } from "../hooks/usePoolData"
import TokenIcon from "./TokenIcon"
import { Tooltip } from "@mui/material"
import { commify } from "@ethersproject/units"
import { useTranslation } from "react-i18next"

interface Props {
  data: PoolDataType | null
}

function PoolInfoCard({ data }: Props): ReactElement | null {
  const { t } = useTranslation()
  if (data == null) return null
  const { type: poolType, underlyingPool } = POOLS_MAP[data?.name]
  const formattedDecimals = poolType === PoolTypes.USD ? 2 : 4
  const swapFee = data?.swapFee
    ? formatBNToPercentString(data.swapFee, POOL_FEE_PRECISION)
    : null
  const adminFee = data?.adminFee
    ? formatBNToPercentString(data.adminFee, POOL_FEE_PRECISION)
    : null
  const formattedData = {
    name: data?.name,
    swapFee,
    aParameter: data?.aParameter
      ? commify(formatBNToString(data.aParameter, 0, 0))
      : "-",
    virtualPrice: data?.virtualPrice
      ? commify(formatBNToString(data.virtualPrice, 18, 5))
      : "-",
    utilization: data?.utilization
      ? formatBNToPercentString(data.utilization, 18, 0)
      : "-",
    reserve: data?.reserve
      ? commify(formatBNToString(data.reserve, 18, 2))
      : "-",
    adminFee: swapFee && adminFee ? `${adminFee} of ${swapFee}` : null,
    volume: data?.volume ? commify(formatBNToString(data.volume, 0, 0)) : "-",
    tokens:
      data?.tokens.map((coin) => {
        const token = TOKENS_MAP[coin.symbol]
        return {
          symbol: token.symbol,
          name: token.name,
          percent: coin.percent,
          value: commify(formatBNToString(coin.value, 18, formattedDecimals)),
        }
      }) || [],
  }

  return (
    <div className="poolInfoCard">
      {underlyingPool ? (
        <Tooltip title={<React.Fragment>{t("metapool")}</React.Fragment>}>
          <h4 className="underline">{formattedData.name}</h4>
        </Tooltip>
      ) : (
        <h4>{formattedData.name}</h4>
      )}
      <div className="info">
        <div className="infoItem">
          <span className="label bold">{`${t("status")}:`}</span>
          <span className="value">{`${
            data?.isPaused ? t("paused") : t("active")
          }`}</span>
        </div>
        <div className="infoItem">
          <span className="label bold">{`${t("fee")}:`}</span>
          <span className="value">{formattedData.swapFee}</span>
        </div>
        <div className="infoItem">
          <Tooltip
            title={<React.Fragment>{t("aParameterTooltip")}</React.Fragment>}
          >
            <span className="label bold underline">{`${t(
              "aParameter",
            )}:`}</span>
          </Tooltip>
          <span className="value">{formattedData.aParameter}</span>
        </div>
        <div className="infoItem">
          <span className="label bold">{`${t("virtualPrice")}:`}</span>
          <span className="value">{formattedData.virtualPrice}</span>
        </div>
        <div className="infoItem">
          <span className="label bold">{`${t("utilization")}:`}</span>
          <span className="value">{formattedData.utilization}</span>
        </div>
        <div className="infoItem">
          <span className="label bold">{`${t("totalLocked")}:`}</span>
          <span className="value">{`$${formattedData.reserve}`}</span>
        </div>
        <div className="twoColumn">
          <div className="infoItem">
            <span className="label bold">{`${t("adminFee")}:`}</span>
            <span className="value">{formattedData.adminFee}</span>
          </div>
          {/* <div className="infoItem">
            <span className="label bold">{t("dailyVolume") + ": "}</span>
            <span className="value">{formattedData.volume}</span>
          </div> */}
        </div>
      </div>
      <Divider />
      <div className="bottom">
        <h4>{t("currencyReserves")}</h4>
        <span>{`$${formattedData.reserve} ${t("inTotal")}`}</span>
        <div className="tokenList">
          {formattedData.tokens.map((token, index) => (
            <div className="token" key={index}>
              <TokenIcon alt="icon" symbol={token.symbol} />
              <span className="bold">{`${token.symbol} ${token.percent}`}</span>
              <span className="tokenValue">{token.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PoolInfoCard
