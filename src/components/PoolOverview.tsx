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
  styled,
  useTheme,
} from "@mui/material"
import {
  IS_SDL_LIVE,
  POOLS_MAP,
  PoolTypes,
  TOKENS_MAP,
  isMetaPool,
} from "../constants"
import { PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement, useMemo } from "react"
import {
  formatBNToPercentString,
  formatBNToShortString,
  formatBNToString,
} from "../utils"

import { Partners } from "../utils/thirdPartyIntegrations"
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
      const apr = poolData.aprs[key]?.apr
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
  const disableText = isOutdated || shouldMigrate || poolData.isPaused
  const chipLabel = useMemo(() => {
    if ((isOutdated || shouldMigrate) && poolData.isPaused) {
      return (
        <span>
          OUTDATED <br />& PAUSED
        </span>
      )
    } else if (isOutdated || shouldMigrate) {
      return <span>OUTDATED</span>
    } else if (poolData.isPaused) {
      return <span>PAUSED</span>
    } else {
      return null
    }
  }, [isOutdated, shouldMigrate, poolData.isPaused])

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
      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={12} lg={3}>
          <Box>
            <Box
              display="flex"
              color={disableText ? theme.palette.text.disabled : undefined}
            >
              <Tooltip title={isMetapool ? <div>{t("metapool")}</div> : ""}>
                <Typography
                  variant="h2"
                  sx={{
                    borderBottom: isMetapool ? "1px dotted" : undefined,
                    mr: 1,
                    width: "fit-content",
                  }}
                >
                  {formattedData.name}
                </Typography>
              </Tooltip>
              {chipLabel && (
                <Chip
                  variant="filled"
                  size="small"
                  label={chipLabel}
                  color={isOutdated || shouldMigrate ? "secondary" : "error"}
                />
              )}
            </Box>
            {hasShare && (
              <div>
                <Typography component="span">{t("balance")}: </Typography>
                <Typography
                  component="span"
                  data-testid={`${formattedData.name}Balance`}
                >{`$${formattedData.userBalanceUSD}`}</Typography>
              </div>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} lg={2.5}>
          <Stack spacing={1} direction={{ xs: "row", lg: "column" }}>
            {formattedData.tokens.length > 0 ? (
              formattedData.tokens.map(({ symbol, icon }) => (
                <Box display="flex" alignItems="center" key={symbol}>
                  <img alt="icon" src={icon} width="24px" />
                  <Typography marginLeft={1} sx={{ wordBreak: "break-all" }}>
                    {symbol}
                  </Typography>
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
        <StyledGrid item xs={6} lg={2} disabled={disableText}>
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
        </StyledGrid>
        <StyledGrid item xs={6} lg={2.5} disabled={disableText}>
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
              <img src={logo} width="24px" />
              :&nbsp;
              <Typography>{formattedData.sdlPerDay}</Typography>
            </Box>
          )}
          {formattedData.apy && (
            <div>
              <Typography component="span">{`${t("apy")}`}: </Typography>
              <Typography component="span">{formattedData.apy}</Typography>
            </div>
          )}
          {Object.keys(poolData.aprs).map((key) => {
            const symbol = poolData.aprs[key]?.symbol as string
            return poolData.aprs[key]?.apr.gt(Zero) ? (
              <div key={symbol}>
                {symbol.includes("/") ? (
                  <Tooltip title={symbol.replaceAll("/", "\n")}>
                    <Typography
                      component="span"
                      sx={{ borderBottom: "1px dotted" }}
                    >
                      Reward APR:&nbsp;
                    </Typography>
                  </Tooltip>
                ) : (
                  <Typography component="span">{symbol} APR: &nbsp;</Typography>
                )}
                <Typography component="span">
                  {formattedData.aprs[key] as string}
                </Typography>
              </div>
            ) : null
          })}
        </StyledGrid>
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

const StyledGrid = styled(Grid)<{ disabled?: boolean }>(
  ({ theme, disabled }) => ({
    color: disabled ? theme.palette.text.disabled : undefined,
  }),
)
