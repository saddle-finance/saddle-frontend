import { Box, Button, Grid, Typography, styled } from "@mui/material"
import {
  commify,
  formatBNToPercentString,
  formatBNToShortString,
  formatBNToString,
} from "../../utils"

import { BigNumber } from "@ethersproject/bignumber"
import { GaugeApr } from "../../providers/AprsProvider"
import React from "react"
import TokenIcon from "../../components/TokenIcon"
import { useTranslation } from "react-i18next"

interface FarmOverviewProps {
  farmName: string
  aprs?: GaugeApr[]
  tvl?: BigNumber
  myStake?: BigNumber
  onClickStake: () => void
}

const TokenGroup = styled("div")(() => ({
  display: "flex",
  "& img:not(:first-of-type)": {
    marginLeft: -5,
  },
}))

export default function FarmOverview({
  farmName,
  aprs,
  tvl,
  myStake,
  onClickStake,
}: FarmOverviewProps): JSX.Element {
  const { t } = useTranslation()
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
      <Grid item xs={2.5}>
        <Typography variant="h2">{farmName}</Typography>
        <TokenGroup>
          <TokenIcon symbol="SDL" alt="sdl" />
          <TokenIcon symbol="WETH" alt="weth" />
        </TokenGroup>
      </Grid>
      <Grid item xs={3}>
        {aprs?.map((aprData) => {
          const { symbol, address } = aprData.rewardToken
          if (aprData.amountPerDay) {
            const { min, max } = aprData.amountPerDay
            if (max.isZero()) return null
            return (
              <Box key={address}>
                <Typography component="span">{symbol}/24h:</Typography>

                <Typography component="span" marginLeft={1}>
                  {`${commify(formatBNToString(min, 18, 0))}-${commify(
                    formatBNToString(max, 18, 0),
                  )}`}
                </Typography>
              </Box>
            )
          } else if (aprData.apr) {
            const { min, max } = aprData.apr
            if (max.isZero()) return null
            return (
              <Box key={address}>
                <Typography component="span">{symbol} apr:</Typography>
                <Typography component="span" marginLeft={1}>
                  {`${formatBNToPercentString(
                    min,
                    18,
                    2,
                  )}-${formatBNToPercentString(max, 18, 2)}`}
                </Typography>
              </Box>
            )
          }
        })}
      </Grid>
      <Grid item xs={1.5}>
        <Typography variant="subtitle1">
          {tvl ? `$${formatBNToShortString(tvl, 18)}` : "_"}
        </Typography>
      </Grid>
      <Grid item xs={1.5}>
        <Typography variant="subtitle1">
          {myStake ? formatBNToShortString(myStake, 18) : "_"}
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
