import { Container, Grid, Typography } from "@mui/material"
import React, { useContext, useState } from "react"

import FarmOverview from "./FarmOverview"
import { GaugeContext } from "../../providers/GaugeProvider"
import StakeDialog from "./StakeDialog"
import { parseEther } from "@ethersproject/units"
import { useTranslation } from "react-i18next"

export default function Farm(): JSX.Element {
  const [activeGaugeAddress, setActiveGaugeAddress] = useState<
    string | undefined
  >()
  const sdlWethPoolName = "SDL/WETH"
  const { gauges } = useContext(GaugeContext)

  return (
    <Container sx={{ pt: 5 }}>
      <FarmListHeader />

      {Object.values(gauges)
        .filter(({ gaugeName }) => gaugeName?.includes("SLP"))
        .map((gauge) => {
          console.log({ addr: gauge.address, name: gauge.gaugeName })
          return (
            <FarmOverview
              key={gauge.address}
              farmName={gauge.poolName || gauge.gaugeName || ""}
              apr={parseEther("20.12")}
              tvl={parseEther("70300000")}
              myStake={parseEther("200330")}
              onClickStake={() => setActiveGaugeAddress(gauge.address)}
            />
          )
        })}

      <StakeDialog
        farmName={sdlWethPoolName}
        open={!!activeGaugeAddress}
        gaugeAddress={activeGaugeAddress}
        onClose={() => setActiveGaugeAddress(undefined)}
      />
    </Container>
  )
}

function FarmListHeader(): JSX.Element {
  const { t } = useTranslation()
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
        <Typography>{t("farms")}</Typography>
      </Grid>
      <Grid item xs={1.5}>
        <Typography>APR</Typography>
      </Grid>
      <Grid item xs={1.5}>
        <Typography>TVL</Typography>
      </Grid>
      <Grid item xs={1.5}>
        <Typography>{t("myStaked")}</Typography>
      </Grid>
    </Grid>
  )
}
