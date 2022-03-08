// import "./PoolOverview.scss"

import {
  Box,
  Button,
  Chip,
  Grid,
  Link,
  Paper,
  Skeleton,
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

import { Zero } from "@ethersproject/constants"
import logo from "../assets/icons/logo.svg"
import { useHistory } from "react-router-dom"
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
  const history = useHistory()

  return (
    <Paper
      sx={{
        p: theme.spacing(2, 3),
        borderColor:
          isOutdated || shouldMigrate
            ? theme.palette.secondary.main
            : theme.palette.other.divider,
      }}
      data-testid="poolOverview"
    >
      <Grid container alignItems="center" spacing={1}>
        <Grid item xs={12} lg={3}>
          <Box>
            <Box>
              <Box display="flex">
                {isMetapool ? (
                  <Tooltip
                    title={<React.Fragment>{t("metapool")}</React.Fragment>}
                  >
                    <Typography
                      variant="h2"
                      sx={{
                        borderBottom: "1px dotted",
                        mr: 1,
                        width: "fit-content",
                      }}
                    >
                      {formattedData.name}
                    </Typography>
                  </Tooltip>
                ) : (
                  <Typography variant="h2" sx={{ mr: 1 }}>
                    {formattedData.name}
                  </Typography>
                )}
                <Stack direction="column">
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
                </Stack>
              </Box>
              {hasShare && (
                <div>
                  <Typography component="span">{t("balance")}: </Typography>
                  <Typography component="span">{`$${formattedData.userBalanceUSD}`}</Typography>
                </div>
              )}
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} lg={2.5}>
          <Stack spacing={1} direction={{ xs: "row", lg: "column" }}>
            {formattedData.tokens.length > 0 ? (
              formattedData.tokens.map(({ symbol, icon }) => (
                <Box display="flex" alignItems="center" key={symbol}>
                  <img alt="icon" src={icon} width="24px" />
                  <Typography marginLeft={1}>{symbol}</Typography>
                </Box>
              ))
            ) : (
              <div>
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </div>
            )}
          </Stack>
        </Grid>
        <Grid item lg={2}>
          <Typography variant="subtitle1">TVL</Typography>
          <Typography component="span">{`$${formattedData.reserve}`}</Typography>

          {formattedData.volume && (
            <div>
              <Typography variant="subtitle1">{`${t(
                "24HrVolume",
              )}`}</Typography>
              <Typography component="span">{formattedData.volume}</Typography>
            </div>
          )}
        </Grid>
        <Grid item lg={2.5}>
          {poolData.sdlPerDay != null && IS_SDL_LIVE && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="subtitle1" mr={1}>
                <Link
                  href="https://blog.saddle.finance/introducing-sdl"
                  target="_blank"
                  rel="noreferrer"
                  sx={{ textDecoration: "underline" }}
                >
                  SDL/24h
                </Link>
              </Typography>
              <img src={logo} className="tokenIcon" width="24px" />
              :&nbsp;
              <Typography>{formattedData.sdlPerDay}</Typography>
            </Box>
          )}
          {formattedData.apy && (
            <div className="margin">
              <Typography component="span" variant="subtitle1">
                {`${t("apy")}`}:{" "}
              </Typography>
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
                      <React.Fragment>Reward APR: </React.Fragment>
                    </Tooltip>
                  </Typography>
                ) : (
                  <Typography component="span" variant="subtitle1">
                    {symbol} APR: &nbsp;
                  </Typography>
                )}
                <Typography component="span">
                  {formattedData.aprs[key as Partners] as string}
                </Typography>
              </div>
            ) : null
          })}
        </Grid>
        <Grid item xs={12} lg={2}>
          <Stack spacing={2}>
            {shouldMigrate ? (
              <Button
                variant="contained"
                color={isOutdated || shouldMigrate ? "secondary" : "primary"}
                fullWidth
                size="large"
                onClick={onClickMigrate}
                disabled={!hasShare}
              >
                {t("migrate")}
              </Button>
            ) : (
              <Button
                variant="contained"
                color={isOutdated || shouldMigrate ? "secondary" : "primary"}
                fullWidth
                size="large"
                disabled={poolData?.isPaused || isOutdated}
                onClick={() => history.push(`${poolRoute}/deposit`)}
              >
                {t("deposit")}
              </Button>
            )}
            <Button
              color={isOutdated || shouldMigrate ? "secondary" : "primary"}
              fullWidth
              size="large"
              onClick={() => history.push(`${poolRoute}/withdraw`)}
            >
              {t("withdraw")}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  )
}
