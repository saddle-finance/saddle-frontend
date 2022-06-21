import { Box, Button, Grid, Typography, styled } from "@mui/material"
import { formatBNToPercentString, formatBNToShortString } from "../../utils"
import { BigNumber } from "@ethersproject/bignumber"
import React from "react"
import TokenIcon from "../../components/TokenIcon"
import { useTranslation } from "react-i18next"

interface FarmOverviewProps {
  farmName: string
  apr?: BigNumber
  tvl?: BigNumber
  myStake?: BigNumber
}

const TokenGroup = styled("div")(() => ({
  display: "flex",
  "& img:not(:first-of-type)": {
    marginLeft: -5,
  },
}))

export default function FarmOverview({
  apr,
  tvl,
  myStake,
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
        <Typography variant="h2">SDL/ETH</Typography>
        <TokenGroup>
          <TokenIcon symbol="SDL" alt="sdl" />
          <TokenIcon symbol="WETH" alt="weth" />
        </TokenGroup>
      </Grid>
      <Grid item xs={1.5}>
        <Typography variant="subtitle1">
          {apr ? formatBNToPercentString(apr, 18) : "_"}
        </Typography>
      </Grid>
      <Grid item xs={1.5}>
        <Typography variant="subtitle1">
          {tvl ? formatBNToShortString(tvl, 18) : "_"}
        </Typography>
      </Grid>
      <Grid item xs={1.5}>
        <Typography variant="subtitle1">
          {myStake ? formatBNToShortString(myStake, 18) : "_"}
        </Typography>
      </Grid>
      <Box mr={0} ml="auto">
        <Button variant="outlined" size="large">
          {t("claimRewards")}
        </Button>
        <Button variant="contained" size="large" sx={{ ml: 2 }}>
          {t("stakeOrUnstake")}
        </Button>
      </Box>
    </Grid>
  )
}
