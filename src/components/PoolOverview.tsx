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
import React, { ReactElement, useCallback } from "react"
import { formatBNToPercentString, formatBNToShortString } from "../utils"
import usePoolData, { PoolDataType } from "../hooks/usePoolData"

import { CheckCircleOutline } from "@mui/icons-material"
import GaugeRewardsDisplay from "./GaugeRewardsDisplay"
import TokenIcon from "./TokenIcon"
import { Zero } from "@ethersproject/constants"
import { areGaugesActive } from "../utils/gauges"
import logo from "../assets/icons/logo.svg"
import { useActiveWeb3React } from "../hooks"
import { useHistory } from "react-router-dom"
import { useTranslation } from "react-i18next"

interface Props {
  poolRoute: string
  poolName: string
  onClickMigrate?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export default function PoolOverview({
  poolRoute,
  onClickMigrate,
  poolName,
}: Props): ReactElement | null {
  const { t } = useTranslation()
  const theme = useTheme()
  const { chainId } = useActiveWeb3React()
  const [poolData, userShareData] = usePoolData(poolName)
  const shouldMigrate = !!onClickMigrate
  const gaugesAreActive = areGaugesActive(chainId)
  const formattedData = {
    name: poolData.name,
    reserve: poolData.reserve
      ? formatBNToShortString(poolData.reserve, 18)
      : "-",
    apy: poolData.apy ? formatBNToPercentString(poolData.apy, 18, 2) : "-",
    volume: poolData.volume
      ? `$${formatBNToShortString(poolData.volume, 18)}`
      : "-",
    userBalanceUSD: formatBNToShortString(
      userShareData?.usdBalance || Zero,
      18,
    ),
    sdlPerDay: formatBNToShortString(poolData?.sdlPerDay || Zero, 18),
    minichefSDLInfo: formatBNToPercentString(poolData.minichefSDLApr, 18, 2),
  }
  const hasShare = !!userShareData?.usdBalance.gt(Zero)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const history = useHistory()
  const disableText = poolData.isGuarded || shouldMigrate || poolData.isPaused
  const renderChips = useCallback(() => {
    let labels: string[] = []
    if (poolData.isGuarded || shouldMigrate) {
      labels = [...labels, "OUTDATED"]
    }
    if (poolData.isPaused) {
      labels = [...labels, "PAUSED"]
    }
    if (!poolData.isSaddleApproved) {
      labels = [...labels, "COMMUNITY"]
    }

    return labels.map((label, i) => (
      <Chip
        key={i}
        variant="filled"
        size="small"
        label={label}
        color={
          poolData.isGuarded || shouldMigrate
            ? "secondary"
            : !poolData.isSaddleApproved
            ? "info"
            : "error"
        }
      />
    ))
  }, [poolData, shouldMigrate])

  let minichefSDLInfo = null
  if (!gaugesAreActive) {
    if (poolData.minichefSDLApr.gt(Zero)) {
      minichefSDLInfo = ["SDL apr", formattedData.minichefSDLInfo]
    } else if (poolData.sdlPerDay?.gt(Zero)) {
      minichefSDLInfo = ["SDL/24h", formattedData.sdlPerDay]
    }
  }
  return (
    <Paper
      sx={{
        p: theme.spacing(2, 3),
        borderColor:
          poolData.isGuarded || shouldMigrate
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
              <Tooltip
                title={poolData.isMetaSwap ? <div>{t("metapool")}</div> : ""}
              >
                <Typography
                  variant="h2"
                  sx={{
                    borderBottom: poolData.isMetaSwap
                      ? "1px dotted"
                      : undefined,
                    mr: 1,
                    width: "fit-content",
                  }}
                >
                  {formattedData.name}
                </Typography>
              </Tooltip>
            </Box>
            <>{renderChips()}</>
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
            {poolData.tokens.length > 0 ? (
              poolData.tokens.map(({ symbol, isOnTokenLists }) => (
                <Box display="flex" alignItems="center" key={symbol}>
                  <TokenIcon alt="icon" symbol={symbol} width="24px" />
                  <Typography marginLeft={1} sx={{ wordBreak: "break-all" }}>
                    {symbol}
                  </Typography>
                  {isOnTokenLists && (
                    <CheckCircleOutline sx={{ marginLeft: 0.5, width: 15 }} />
                  )}
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
          {formattedData.apy && (
            <div>
              <Typography component="span">{`${t("apy")}`}: </Typography>
              <Typography component="span">{formattedData.apy}</Typography>
            </div>
          )}
          {minichefSDLInfo && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="subtitle1" mr={1}>
                <Link
                  href="https://blog.saddle.finance/introducing-sdl"
                  target="_blank"
                  rel="noreferrer"
                  sx={{ textDecoration: "underline" }}
                >
                  {minichefSDLInfo[0]}
                </Link>
              </Typography>
              <img src={logo} width="24px" />
              :&nbsp;
              <Typography>{minichefSDLInfo[1]}</Typography>
            </Box>
          )}
          {gaugesAreActive ? (
            <GaugeRewardsDisplay aprs={poolData.gaugeAprs} />
          ) : (
            <MinichefRewards poolData={poolData} />
          )}
        </StyledGrid>
        <Grid item xs={12} lg={2}>
          <Stack spacing={2}>
            {shouldMigrate ? (
              <Button
                variant="contained"
                color={
                  poolData.isGuarded || shouldMigrate ? "secondary" : "primary"
                }
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
                color={
                  poolData.isGuarded || shouldMigrate ? "secondary" : "primary"
                }
                fullWidth
                size="large"
                disabled={poolData?.isPaused || poolData.isGuarded}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                onClick={() => history.push(`${poolRoute}/deposit`)}
              >
                {t("deposit")}
              </Button>
            )}
            <Button
              color={
                poolData.isGuarded || shouldMigrate ? "secondary" : "primary"
              }
              fullWidth
              size="large"
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
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

const MinichefRewards = ({ poolData }: { poolData: PoolDataType }) => {
  const formattedAprs = Object.keys(poolData.aprs).reduce((acc, key) => {
    const apr = poolData.aprs[key]?.apr
    return apr
      ? {
          ...acc,
          [key]: formatBNToPercentString(apr, 18),
        }
      : acc
  }, {} as Partial<Record<string, string>>)
  return (
    <>
      {Object.keys(poolData.aprs).map((key) => {
        const symbol = poolData.aprs[key]?.symbol as string
        return poolData.aprs[key]?.apr.gt(Zero) ? (
          <Box key={symbol}>
            {symbol.includes("/") ? (
              <Tooltip title={symbol.replaceAll("/", "\n")}>
                <Typography
                  component="span"
                  sx={{ borderBottom: "1px dotted" }}
                >
                  Reward APR:
                </Typography>
              </Tooltip>
            ) : (
              <Typography component="span">{symbol} apr:</Typography>
            )}
            <Typography component="span" marginLeft={1}>
              {formattedAprs[key] as string}
            </Typography>
          </Box>
        ) : null
      })}
    </>
  )
}
