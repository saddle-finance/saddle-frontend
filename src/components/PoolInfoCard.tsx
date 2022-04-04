import "./PoolInfoCard.scss"

import { Box, Divider, Typography, styled } from "@mui/material"
import {
  POOLS_MAP,
  POOL_FEE_PRECISION,
  PoolTypes,
  TOKENS_MAP,
} from "../constants"
import React, { ReactElement } from "react"
import { formatBNToPercentString, formatBNToString } from "../utils"

import { PoolDataType } from "../hooks/usePoolData"
import { Tooltip } from "@mui/material"
import { commify } from "@ethersproject/units"
import { useTranslation } from "react-i18next"

interface Props {
  data: PoolDataType | null
}

const InfoItem = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  flexDirection: "row",
  minWidth: "50%",
}))

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
          icon: token.icon,
          percent: coin.percent,
          value: commify(formatBNToString(coin.value, 18, formattedDecimals)),
        }
      }) || [],
  }

  return (
    <div className="poolInfoCard">
      {underlyingPool ? (
        <Tooltip title={<React.Fragment>{t("metapool")}</React.Fragment>}>
          <Typography
            variant="h1"
            sx={{
              borderBottom: "1px dotted",
              width: "fit-content",
              cursor: "help",
            }}
          >
            {formattedData.name}
          </Typography>
        </Tooltip>
      ) : (
        <Typography variant="h1">{formattedData.name}</Typography>
      )}
      <InfoItem>
        <Typography>{`${t("status")}:`}</Typography>
        <Typography>{`${
          data?.isPaused ? t("paused") : t("active")
        }`}</Typography>
      </InfoItem>
      <InfoItem>
        <Typography>{`${t("totalLocked")}:`}</Typography>
        <Typography variant="subtitle1">{`$${formattedData.reserve}`}</Typography>
      </InfoItem>
      {/* <InfoItem>
        <Typography>{t("dailyVolume") + ": "}</Typography>
        <Typography variant="subtitle1">{formattedData.volume}</Typography>
      </InfoItem> */}

      <Box>
        <InfoItem>
          <Typography>{`${t("fee")}:`}</Typography>
          <Typography>{formattedData.swapFee}</Typography>
        </InfoItem>
        <InfoItem>
          <Tooltip
            title={<React.Fragment>{t("aParameterTooltip")}</React.Fragment>}
          >
            <Typography
              sx={{ cursor: "help", borderBottom: "1px dotted" }}
            >{`${t("aParameter")}:`}</Typography>
          </Tooltip>
          <Typography>{formattedData.aParameter}</Typography>
        </InfoItem>
        <InfoItem>
          <Typography>{`${t("virtualPrice")}:`}</Typography>
          <Typography variant="subtitle1">
            {formattedData.virtualPrice}
          </Typography>
        </InfoItem>
        <InfoItem>
          <Typography>{`${t("utilization")}:`}</Typography>
          <Typography variant="subtitle1">
            {formattedData.utilization}
          </Typography>
        </InfoItem>

        <InfoItem>
          <Typography>{`${t("adminFee")}:`}</Typography>
          <Typography variant="subtitle1">{formattedData.adminFee}</Typography>
        </InfoItem>
      </Box>

      <Divider sx={{ my: 3 }} />
      <div className="bottom">
        <Typography variant="h1">{t("currencyReserves")}</Typography>
        <span>{`$${formattedData.reserve} ${t("inTotal")}`}</span>
        <div className="tokenList">
          {formattedData.tokens.map((token, index) => (
            <div className="token" key={index}>
              <img alt="icon" src={token.icon} />
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
