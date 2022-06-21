import { Container, Grid, Typography } from "@mui/material"
import FarmOverview from "../components/FarmOverview"
import React from "react"
import { parseEther } from "@ethersproject/units"

export default function Farm() {
  return (
    <Container sx={{ pt: 5 }}>
      <FarmListHeader />

      <FarmOverview
        farmName="SDL/ETH"
        apr={parseEther("20.12")}
        tvl={parseEther("70300000")}
        myStake={parseEther("200330")}
      />
      <FarmOverview
        farmName="SDL/ETH"
        apr={parseEther("20.12")}
        tvl={parseEther("70300000")}
        myStake={parseEther("200330")}
      />
    </Container>
  )
}

function FarmListHeader() {
  return (
    <Grid
      container
      direction="row"
      sx={{
        py: 1,
        px: 3,
      }}
    >
      <Grid item xs={2.5}>
        <Typography>Farms</Typography>
      </Grid>
      <Grid item xs={1.5}>
        <Typography>APR</Typography>
      </Grid>
      <Grid item xs={1.5}>
        <Typography>TVL</Typography>
      </Grid>
      <Grid item xs={1.5}>
        <Typography>My Staked</Typography>
      </Grid>
    </Grid>
  )
}
