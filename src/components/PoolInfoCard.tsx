import { Box, Divider, Typography, styled } from "@mui/material"
import {
  POOLS_MAP,
  POOL_FEE_PRECISION,
  PoolTypes,
  TOKENS_MAP,
} from "../constants"
import React, { ReactElement } from "react"
import { commify, formatUnits } from "@ethersproject/units"
import {
  formatBNToPercentString,
  formatBNToShortString,
  formatBNToString,
} from "../utils"

// import { Partners } from "../utils/thirdPartyIntegrations"
import { PoolDataType } from "../hooks/usePoolData"
import TokenIcon from "./TokenIcon"
import { Tooltip } from "@mui/material"
import { Zero } from "@ethersproject/constants"
import { useTranslation } from "react-i18next"

interface Props {
  data: PoolDataType | null
}

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexDirection: "row",
  minWidth: "50%",
  "& p:first-of-type": {
    marginRight: theme.spacing(0.5),
  },
  [theme.breakpoints.down("sm")]: {
    minWidth: "100%",
  },
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
    aprs: data.aprs,
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
    volume: data?.volume ? formatBNToShortString(data.volume, 18) : "-",
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
        <Typography variant="subtitle1">{`${
          data?.isPaused ? t("paused") : t("active")
        }`}</Typography>
      </InfoItem>
      <InfoItem>
        <Typography>{`${t("totalLocked")}:`}</Typography>
        <Typography variant="subtitle1">{`${formattedData.reserve}`}</Typography>
      </InfoItem>
      <InfoItem>
        <Typography>{t("dailyVolume") + ": "}</Typography>
        <Typography variant="subtitle1">{formattedData.volume}</Typography>
      </InfoItem>

      <Box display="flex" mt={3} flexWrap="wrap">
        <InfoItem>
          {Object.keys(formattedData.aprs).map((key) => {
            const symbol = formattedData.aprs[key]?.symbol as string
            const apr = formattedData.aprs[key]?.apr
            return formattedData.aprs[key]?.apr.gt(Zero) ? (
              <React.Fragment key={symbol}>
                {symbol.includes("/") ? (
                  <Tooltip title={symbol.replaceAll("/", "\n")}>
                    <Typography sx={{ borderBottom: "1px dotted" }}>
                      Reward APR:
                    </Typography>
                  </Tooltip>
                ) : (
                  <Typography>{symbol} APR: &nbsp;</Typography>
                )}
                <Typography variant="subtitle1">
                  {apr && formatUnits(apr, 18)}
                </Typography>
              </React.Fragment>
            ) : null
          })}
        </InfoItem>
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
            <Typography sx={{ cursor: "help", borderBottom: "1px dotted" }}>
              {`${t("aParameter")}:`}
            </Typography>
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
        <Typography variant="h2">{t("currencyReserves")}</Typography>
        <Typography mt={2}>{`$${formattedData.reserve} ${t(
          "inTotal",
        )}`}</Typography>
        <Box display="flex" flexWrap="wrap">
          {formattedData.tokens.map((token, index) => (
            <Box key={index} minWidth={{ xs: "100%", sm: "50%" }} mt={2}>
              <Box display="flex" flexWrap="nowrap">
                <TokenIcon alt="icon" symbol={token.symbol} />
                <Typography
                  variant="subtitle1"
                  ml={1}
                >{`${token.symbol} ${token.percent}`}</Typography>
              </Box>
              <Typography data-testid="tokenValue">${token.value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default PoolInfoCard
