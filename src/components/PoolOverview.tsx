// import "./PoolOverview.scss"

import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material"
import {
  IS_SDL_LIVE,
  POOLS_MAP,
  PoolTypes,
  TOKENS_MAP,
  isMetaPool,
} from "../constants"
import { Partners, PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement } from "react"
import {
  formatBNToPercentString,
  formatBNToShortString,
  formatBNToString,
} from "../utils"

import { Link } from "react-router-dom"
import { Zero } from "@ethersproject/constants"
import logo from "../assets/icons/logo.svg"
import { useTranslation } from "react-i18next"

interface Props {
  poolRoute: string
  poolData: PoolDataType
  userShareData: UserShareType | null
  onClickMigrate?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export default function PoolOverview({
  poolData,
  poolRoute,
  userShareData,
  onClickMigrate,
}: Props): ReactElement | null {
  const { t } = useTranslation()
  const theme = useTheme()
  const { type: poolType, isOutdated } = POOLS_MAP[poolData.name]
  const formattedDecimals = poolType === PoolTypes.USD ? 2 : 4
  const shouldMigrate = !!onClickMigrate
  const formattedData = {
    name: poolData.name,
    reserve: poolData.reserve
      ? formatBNToShortString(poolData.reserve, 18)
      : "-",
    aprs: Object.keys(poolData.aprs).reduce((acc, key) => {
      const apr = poolData.aprs[key as Partners]?.apr
      return apr
        ? {
            ...acc,
            [key]: formatBNToPercentString(apr, 18),
          }
        : acc
    }, {} as Partial<Record<Partners, string>>),
    apy: poolData.apy ? `${formatBNToPercentString(poolData.apy, 18, 2)}` : "-",
    volume: poolData.volume
      ? `$${formatBNToShortString(poolData.volume, 18)}`
      : "-",
    userBalanceUSD: formatBNToShortString(
      userShareData?.usdBalance || Zero,
      18,
    ),
    sdlPerDay: formatBNToShortString(poolData?.sdlPerDay || Zero, 18),
    tokens: poolData.tokens.map((coin) => {
      const token = TOKENS_MAP[coin.symbol]
      return {
        symbol: token.symbol,
        name: token.name,
        icon: token.icon,
        value: formatBNToString(coin.value, token.decimals, formattedDecimals),
      }
    }),
  }
  const hasShare = !!userShareData?.usdBalance.gt("0")
  const isMetapool = isMetaPool(formattedData.name)

  // className={classNames("poolOverview", {
  //   outdated: isOutdated || shouldMigrate,
  // })}
  return (
    <Paper
      sx={{
        p: theme.spacing(2, 3),
        borderColor:
          isOutdated || shouldMigrate
            ? theme.palette.secondary.main
            : theme.palette.other.divider,
      }}
    >
      <Grid container alignItems="center">
        <Grid item lg={4}>
          <Box>
            <Box>
              <Box display="flex">
                {isMetapool ? (
                  <Tooltip
                    title={<React.Fragment>{t("metapool")}</React.Fragment>}
                  >
                    <Typography
                      variant="h2"
                      sx={{ borderBottom: "1px dotted", mr: 1 }}
                    >
                      {formattedData.name}
                    </Typography>
                  </Tooltip>
                ) : (
                  <Typography variant="h2" sx={{ mr: 1 }}>
                    {formattedData.name}
                  </Typography>
                )}
                {(shouldMigrate || isOutdated) && (
                  <Chip
                    variant="filled"
                    size="small"
                    label="OUTDATED"
                    color="secondary"
                  />
                )}
                {poolData.isPaused && (
                  <Chip
                    variant="filled"
                    size="small"
                    label="PAUSED"
                    color="error"
                  />
                )}
              </Box>
              {hasShare && (
                <div className="balance">
                  <Typography component="span">{t("balance")}: </Typography>
                  <Typography component="span">{`$${formattedData.userBalanceUSD}`}</Typography>
                </div>
              )}
            </Box>
          </Box>
        </Grid>
        <Grid item lg={2}>
          <Stack spacing={1}>
            {formattedData.tokens.map(({ symbol, icon }) => (
              <Box display="flex" alignItems="center" key={symbol}>
                <img alt="icon" src={icon} width="24px" />
                <Typography marginLeft={1}>{symbol}</Typography>
              </Box>
            ))}
          </Stack>
        </Grid>
        <Grid item lg={2}>
          <Typography variant="subtitle1">TVL</Typography>
          <Typography component="span">{`$${formattedData.reserve}`}</Typography>

          {formattedData.volume && (
            <div>
              <Typography component="span" variant="subtitle1">{`${t(
                "24HrVolume",
              )}`}</Typography>
              <Typography component="span">{formattedData.volume}</Typography>
            </div>
          )}
        </Grid>
        <Grid item lg={2}>
          {poolData.sdlPerDay != null && IS_SDL_LIVE && (
            <div className="margin">
              <Typography component="span" variant="subtitle1">
                <a
                  href="https://blog.saddle.finance/introducing-sdl"
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "underline" }}
                >
                  SDL/24h
                </a>
              </Typography>
              <Typography component="span">
                <img src={logo} className="tokenIcon" width="24px" />
                {formattedData.sdlPerDay}
              </Typography>
            </div>
          )}
          {formattedData.apy && (
            <div className="margin">
              <Typography component="span" variant="subtitle1">{`${t(
                "apy",
              )}`}</Typography>
              <Typography component="span">{formattedData.apy}</Typography>
            </div>
          )}
          {Object.keys(poolData.aprs).map((key) => {
            const symbol = poolData.aprs[key as Partners]?.symbol as string
            return poolData.aprs[key as Partners]?.apr.gt(Zero) ? (
              <div className="margin Apr" key={symbol}>
                {symbol.includes("/") ? (
                  <Typography
                    component="span"
                    variant="subtitle1"
                    sx={{ borderBottom: "1px dotted" }}
                  >
                    <Tooltip
                      title={
                        <React.Fragment>
                          {symbol.replaceAll("/", "\n")}
                        </React.Fragment>
                      }
                    >
                      <React.Fragment>Reward APR</React.Fragment>
                    </Tooltip>
                  </Typography>
                ) : (
                  <Typography component="span" variant="subtitle1">
                    {symbol} APR
                  </Typography>
                )}
                <Typography>
                  {formattedData.aprs[key as Partners] as string}
                </Typography>
              </div>
            ) : null
          })}
        </Grid>
        <Grid item lg={2}>
          <Stack spacing={2}>
            <Link
              to={`${poolRoute}/deposit`}
              style={{ textDecoration: "none" }}
            >
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={poolData?.isPaused || isOutdated}
              >
                {t("deposit")}
              </Button>
            </Link>
            {shouldMigrate ? (
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                onClick={onClickMigrate}
                disabled={!hasShare}
              >
                {t("migrate")}
              </Button>
            ) : (
              <Link
                to={`${poolRoute}/withdraw`}
                style={{ textDecoration: "none" }}
              >
                <Button color="primary" fullWidth size="large">
                  {t("withdraw")}
                </Button>
              </Link>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  )
}
