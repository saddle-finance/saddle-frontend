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
  flexBasis: "50%",
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
    <Box>
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
      <InfoItem mt={3}>
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

      <Box display="flex" mt={3} flexWrap="wrap">
        <InfoItem>
          <Typography>{`${t("fee")}:`}</Typography>
          <Typography variant="subtitle1">{formattedData.swapFee}</Typography>
        </InfoItem>
        <InfoItem>
          <Typography>{`${t("virtualPrice")}:`}</Typography>
          <Typography variant="subtitle1">
            {formattedData.virtualPrice}
          </Typography>
        </InfoItem>
        <InfoItem>
          <Tooltip
            title={<React.Fragment>{t("aParameterTooltip")}</React.Fragment>}
          >
            <Typography
              sx={{ cursor: "help", borderBottom: "1px dotted" }}
            >{`${t("aParameter")}:`}</Typography>
          </Tooltip>
          <Typography variant="subtitle1">
            {formattedData.aParameter}
          </Typography>
        </InfoItem>

        <InfoItem>
          <Typography>{`${t("utilization")}:`}</Typography>
          <Typography variant="subtitle1">
            {formattedData.utilization}
          </Typography>
        </InfoItem>
      </Box>
      <InfoItem>
        <Typography>{`${t("adminFee")}:`}</Typography>
        <Typography variant="subtitle1">{formattedData.adminFee}</Typography>
      </InfoItem>

      <Divider sx={{ my: 3 }} />
      <Box>
        <Typography variant="h1">{t("currencyReserves")}</Typography>
        <Typography mt={2}>{`$${formattedData.reserve} ${t(
          "inTotal",
        )}`}</Typography>
        <Box display="flex" flexWrap="wrap">
          {formattedData.tokens.map((token, index) => (
            <Box key={index} flexBasis={{ xs: "100%", sm: "50%" }} mt={2}>
              <Box display="flex">
                <img alt="icon" src={token.icon} />
                <Typography
                  variant="subtitle1"
                  ml={1}
                >{`${token.symbol} ${token.percent}`}</Typography>
              </Box>
              <Typography className="tokenValue">${token.value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default PoolInfoCard
