import { Container, Grid, Typography } from "@mui/material"
import React, { useContext, useState } from "react"

import { AppState } from "../../state"
import { AprsContext } from "../../providers/AprsProvider"
import FarmOverview from "./FarmOverview"
import { GaugeContext } from "../../providers/GaugeProvider"
import StakeDialog from "./StakeDialog"
import { UserStateContext } from "../../providers/UserStateProvider"
import { parseEther } from "@ethersproject/units"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

type ActiveGauge = {
  address: string
  displayName: string
}
export default function Farm(): JSX.Element {
  const [activeGauge, setActiveGauge] = useState<ActiveGauge | undefined>()
  const { gauges } = useContext(GaugeContext)
  const gaugeAprs = useContext(AprsContext)
  const { sdlWethSushiPool, tokenPricesUSD } = useSelector(
    (state: AppState) => state.application,
  )
  const userState = useContext(UserStateContext)
  const sdlWethPoolTvl = sdlWethSushiPool?.wethReserve
    ? sdlWethSushiPool.wethReserve
        .mul(parseEther(String(tokenPricesUSD?.["ETH"] || "0.0")))
        .mul(parseEther("2"))
    : undefined

  return (
    <Container sx={{ pt: 5 }}>
      <FarmListHeader />

      {Object.values(gauges)
        .filter(({ gaugeName }) => gaugeName?.includes("SLP"))
        .map((gauge) => {
          const farmName =
            gauge.gaugeName === "SLP-gauge"
              ? "SDL/WETH SLP"
              : gauge.poolName || gauge.gaugeName || ""
          const gaugeAddress = gauge.address
          const gaugeApr = gaugeAprs?.[gaugeAddress]
          const myStack = userState?.gaugeRewards?.[gaugeAddress]?.amountStaked
          return (
            <FarmOverview
              key={gauge.address}
              farmName={farmName}
              aprs={gaugeApr}
              tvl={sdlWethPoolTvl}
              myStake={myStack}
              onClickStake={() =>
                setActiveGauge({
                  address: gauge.address,
                  displayName: farmName,
                })
              }
            />
          )
        })}

      <StakeDialog
        farmName={activeGauge?.displayName}
        open={!!activeGauge}
        gaugeAddress={activeGauge?.address}
        onClose={() => setActiveGauge(undefined)}
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
