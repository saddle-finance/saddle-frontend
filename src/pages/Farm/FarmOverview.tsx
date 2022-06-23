import { Box, Button, Grid, Typography, styled } from "@mui/material"

import { BigNumber } from "@ethersproject/bignumber"
import { GaugeApr } from "../../providers/AprsProvider"
import GaugeRewardsDisplay from "../../components/GaugeRewardsDisplay"
import React from "react"
import TokenIcon from "../../components/TokenIcon"
import { Zero } from "@ethersproject/constants"
import { formatBNToShortString } from "../../utils"
import usePoolData from "../../hooks/usePoolData"
import { useTranslation } from "react-i18next"

interface FarmOverviewProps {
  farmName: string
  poolName: string | null
  aprs?: GaugeApr[]
  tvl?: BigNumber
  myStake: BigNumber
  onClickStake: () => void
  onClickClaim: () => void
}

const TokenGroup = styled("div")(() => ({
  display: "flex",
  "& img:not(:first-of-type)": {
    marginLeft: -5,
  },
}))

export default function FarmOverview({
  farmName,
  poolName,
  aprs,
  tvl,
  myStake,
  onClickStake,
}: // onClickClaim,
FarmOverviewProps): JSX.Element {
  const { t } = useTranslation()
  const [farmData] = usePoolData(poolName || "")
  const farmTokens = farmData.tokens

  return (
    <Grid
      container
      alignItems="center"
      direction="row"
      sx={{
        backgroundColor: (theme) => theme.palette.background.paper,
        border: (theme) => `${theme.palette.other.divider} solid 1px`,
        py: 1,
        px: 3,
      }}
    >
      <Grid item xs={3.5}>
        <Typography variant="h2">{farmName}</Typography>
        <TokenGroup>
          {farmName === "SDL/WETH SLP" ? (
            <>
              <TokenIcon symbol="SDL" alt="sdl" />
              <TokenIcon symbol="WETH" alt="weth" />
            </>
          ) : (
            farmTokens.map((token) => (
              <TokenIcon
                key={token.symbol}
                symbol={token.symbol}
                alt={token.symbol}
              />
            ))
          )}
        </TokenGroup>
      </Grid>
      <Grid item xs={3}>
        <GaugeRewardsDisplay aprs={aprs} />
      </Grid>
      <Grid item xs={1.5}>
        <Typography variant="subtitle1">
          {tvl ? `$${formatBNToShortString(tvl, 18)}` : "_"}
        </Typography>
      </Grid>
      <Grid item xs={1.5}>
        <Typography variant="subtitle1">
          {myStake?.gt(Zero) ? formatBNToShortString(myStake, 18) : "_"}
        </Typography>
      </Grid>
      <Box mr={0} ml="auto">
        {/* <Button variant="outlined" size="large">
          {t("claimRewards")}
        </Button> */}
        <Button
          variant="contained"
          size="large"
          sx={{ ml: 2 }}
          onClick={onClickStake}
        >
          {t("stakeOrUnstake")}
        </Button>
      </Box>
    </Grid>
  )
}
