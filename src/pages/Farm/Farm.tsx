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
import useUserGauge from "../../hooks/useUserGauge"

export default function Farm(): JSX.Element {
  const [activeGaugeAddress, setActiveGaugeAddress] = useState<
    string | undefined
  >()
  const sdlWethPoolName = "SDL/WETH"
  const { gauges } = useContext(GaugeContext)
  const gaugeAprs = useContext(AprsContext)
  const { sdlWethSushiPool, tokenPricesUSD } = useSelector(
    (state: AppState) => state.application,
  )
  const userState = useContext(UserStateContext)
  const userGauge = useUserGauge()
  userGauge?.userStakedLpTokenBalance
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
          const gaugeAddress = gauge.address
          const gaugeApr = gaugeAprs?.[gaugeAddress]
          const myStack = userState?.gaugeRewards?.[gaugeAddress]?.amountStaked
          return (
            <FarmOverview
              key={gauge.address}
              farmName={gauge.poolName || gauge.gaugeName || ""}
              aprs={gaugeApr}
              tvl={sdlWethPoolTvl}
              myStake={myStack}
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
