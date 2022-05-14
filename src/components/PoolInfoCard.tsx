import { Box, Divider, Link, Typography, styled } from "@mui/material"
import { POOLS_MAP, POOL_FEE_PRECISION, PoolTypes } from "../constants"
import React, { ReactElement } from "react"
import {
  bnSum,
  formatBNToPercentString,
  formatBNToShortString,
  formatBNToString,
} from "../utils"
import { commify, parseUnits } from "@ethersproject/units"

import { AppState } from "../state"
import { PoolDataType } from "../hooks/usePoolData"
import TokenIcon from "./TokenIcon"
import { Tooltip } from "@mui/material"
import { Zero } from "@ethersproject/constants"
import { getMultichainScanLink } from "../utils/getEtherscanLink"
import { shortenAddress } from "../utils/shortenAddress"
import { useActiveWeb3React } from "../hooks"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  data: PoolDataType | null
}

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexDirection: "row",
  "& p:first-of-type": {
    marginRight: theme.spacing(0.5),
  },
}))

function PoolInfoCard({ data }: Props): ReactElement | null {
  const { chainId } = useActiveWeb3React()
  const { t } = useTranslation()
  const { swapStats } = useSelector((state: AppState) => state.application)
  if (data == null || chainId == null) return null
  const poolAddress = (
    POOLS_MAP?.[data.name]?.metaSwapAddresses?.[chainId] ||
    POOLS_MAP?.[data.name]?.addresses[chainId]
  )?.toLowerCase()
  const { oneDayVolume, utilization } =
    swapStats && poolAddress in swapStats
      ? swapStats[poolAddress]
      : { oneDayVolume: null, utilization: null }
  const formattedDecimals = data?.poolType === PoolTypes.USD ? 2 : 4
  const swapFee = data?.swapFee
    ? formatBNToPercentString(data.swapFee, POOL_FEE_PRECISION)
    : null
  const adminFee = data?.adminFee
    ? formatBNToPercentString(data.adminFee, POOL_FEE_PRECISION)
    : null
  const coinsSum =
    data?.tokens.map(({ value }) => value).reduce(bnSum, Zero) || Zero
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
    utilization: utilization
      ? formatBNToPercentString(parseUnits(utilization, 18), 18, 0)
      : "-",
    reserve: data?.reserve
      ? commify(formatBNToString(data.reserve, 18, 2))
      : "-",
    adminFee: swapFee && adminFee ? `${adminFee} of ${swapFee}` : null,
    volume: oneDayVolume
      ? formatBNToShortString(parseUnits(oneDayVolume, 18), 18)
      : "-",
    tokens:
      data?.tokens.map((coin) => {
        return {
          symbol: coin.symbol,
          name: coin.name,
          percent: coinsSum.gt(Zero)
            ? formatBNToPercentString(
                coin.value.mul(BigInt(1e18)).div(coinsSum),
                18,
              )
            : "-",
          value: commify(formatBNToString(coin.value, 18, formattedDecimals)),
        }
      }) || [],
  }

  return (
    <Box>
      {data.isMetaSwap ? (
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
        <Typography component="span" variant="h1" mr={2}>
          {formattedData.name}
        </Typography>
      )}
      <InfoItem mt={3}>
        <Typography>{`${t("status")}:`}</Typography>
        <Typography variant="subtitle1">{`${
          data?.isPaused ? t("paused") : t("active")
        }`}</Typography>
      </InfoItem>
      <InfoItem>
        <Typography>{`${t("totalLocked")}:`}</Typography>
        <Typography variant="subtitle1">{`$${formattedData.reserve}`}</Typography>
      </InfoItem>
      <InfoItem>
        <Typography>{t("dailyVolume")}:</Typography>
        <Typography variant="subtitle1">${formattedData.volume}</Typography>
      </InfoItem>

      <Box mt={3}>
        {Object.keys(formattedData.aprs).map((key) => {
          const symbol = formattedData.aprs[key]?.symbol as string
          const apr = formattedData.aprs[key]?.apr
          return formattedData.aprs[key]?.apr.gt(Zero) ? (
            <InfoItem key={symbol}>
              {symbol.includes("/") ? (
                <Tooltip title={symbol.replaceAll("/", "\n")}>
                  <Typography sx={{ borderBottom: "1px dotted" }}>
                    Reward APR:
                  </Typography>
                </Tooltip>
              ) : (
                <Typography>{`${symbol} APR:`}</Typography>
              )}
              <Typography variant="subtitle1">
                {apr && formatBNToPercentString(apr, 18)}
              </Typography>
            </InfoItem>
          ) : null
        })}

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
      <InfoItem flex={1}>
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
              <Box display="flex" flexWrap="nowrap" alignItems="center">
                <TokenIcon
                  alt="icon"
                  symbol={token.symbol}
                  width={20}
                  height={20}
                />
                <Typography
                  variant="subtitle1"
                  ml={1}
                >{`${token.symbol} ${token.percent}`}</Typography>
              </Box>
              <Typography>{token.value}</Typography>
            </Box>
          ))}
        </Box>
        <Typography mt={3}>
          Pool address:
          <Link
            href={getMultichainScanLink(chainId, poolAddress, "address")}
            target="_blank"
            color="inherit"
            ml={1}
          >
            {shortenAddress(poolAddress)}
          </Link>
        </Typography>
        <Typography mt={1}>
          LP token address:
          <Link
            href={getMultichainScanLink(chainId, data.lpToken, "token")}
            target="_blank"
            color="inherit"
            ml={1}
          >
            {data.lpToken && shortenAddress(data.lpToken)}
          </Link>
        </Typography>
        {/* TODO: Gauge link */}
      </Box>
    </Box>
  )
}

export default PoolInfoCard
