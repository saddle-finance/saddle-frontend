import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import React, { useContext, useState } from "react"

import { AprsContext } from "../../providers/AprsProvider"
import { BasicPoolsContext } from "../../providers/BasicPoolsProvider"
import ClaimRewardsDlg from "./ClaimRewardsDlg"
import FarmOverview from "./FarmOverview"
import { GaugeContext } from "../../providers/GaugeProvider"
import StakeDialog from "./StakeDialog"
import { UserStateContext } from "../../providers/UserStateProvider"
import VeSDLWrongNetworkModal from "../VeSDL/VeSDLWrongNetworkModal"
import { Zero } from "@ethersproject/constants"
import { useActiveWeb3React } from "../../hooks"
import useGaugeTVL from "../../hooks/useGaugeTVL"
import { useTranslation } from "react-i18next"

type ActiveGauge = {
  address: string
  displayName: string
}
const sushiGaugeName = "SLP-gauge"
export default function Farm(): JSX.Element {
  const [activeGauge, setActiveGauge] = useState<ActiveGauge | undefined>()
  const [activeDialog, setActiveDialog] = useState<
    "stake" | "claim" | undefined
  >()
  const { account } = useActiveWeb3React()
  const basicPools = useContext(BasicPoolsContext)
  const { gauges } = useContext(GaugeContext)
  const gaugeAprs = useContext(AprsContext)
  const userState = useContext(UserStateContext)
  const getGaugeTVL = useGaugeTVL()

  if (!account) {
    return (
      <Container>
        <Paper sx={{ display: "flex", justifyContent: "center", padding: 4 }}>
          <Typography>Please connect your wallet to see farms.</Typography>
        </Paper>
      </Container>
    )
  }

  return (
    <Container sx={{ pt: 5 }}>
      <Box
        position="sticky"
        top={0}
        bgcolor={(theme) => theme.palette.background.paper}
        zIndex={(theme) => theme.zIndex.mobileStepper - 1}
        py={2}
      >
        <FarmListHeader />
      </Box>

      {Object.values(gauges)
        // .filter(({ gaugeName }) => gaugeName?.includes("SLP")) // uncomment to only show SLP gauge
        .map((gauge) => {
          const poolName = gauge.poolName
          const farmName =
            gauge.gaugeName === sushiGaugeName
              ? "SDL/WETH SLP"
              : poolName || gauge.gaugeName || ""
          const gaugeAddress = gauge.address
          const aprs = gaugeAprs?.[gaugeAddress]
          const myStake =
            userState?.gaugeRewards?.[gaugeAddress]?.amountStaked || Zero
          const tvl = getGaugeTVL(gaugeAddress)
          const gaugePoolAddress = gauge.poolAddress

          const gaugePool = Object.values(basicPools || {}).find(
            (pool) => pool.poolAddress === gaugePoolAddress,
          )
          const poolTokens = gaugePool?.tokens
          return {
            gauge,
            gaugeAddress,
            farmName,
            poolTokens,
            aprs,
            tvl,
            myStake,
          } as const
        })
        .sort((a, b) => {
          if (a.gauge.gaugeName === sushiGaugeName) {
            return -1
          }
          if (b.gauge.gaugeName === sushiGaugeName) {
            return 1
          }
          return a.myStake.gt(b.myStake) ? -1 : a.tvl.gt(b.tvl) ? -1 : 1
        })
        .map(({ gaugeAddress, farmName, aprs, poolTokens, tvl, myStake }) => {
          return (
            <FarmOverview
              farmName={farmName}
              poolTokens={poolTokens}
              aprs={aprs}
              tvl={tvl}
              myStake={myStake}
              key={gaugeAddress}
              onClickStake={() => {
                setActiveDialog("stake")
                setActiveGauge({
                  address: gaugeAddress,
                  displayName: farmName,
                })
              }}
              onClickClaim={() => {
                setActiveDialog("claim")
                setActiveGauge({
                  address: gaugeAddress,
                  displayName: farmName,
                })
              }}
            />
          )
        })}

      <StakeDialog
        farmName={activeGauge?.displayName}
        open={activeDialog === "stake"}
        gaugeAddress={activeGauge?.address}
        onClose={() => {
          setActiveDialog(undefined)
          setActiveGauge(undefined)
        }}
        onClickClaim={() => {
          setActiveDialog("claim")
        }}
      />
      <ClaimRewardsDlg
        open={activeDialog === "claim"}
        gaugeAddress={activeGauge?.address}
        displayName={activeGauge?.displayName}
        onClose={() => {
          setActiveDialog(undefined)
          setActiveGauge(undefined)
        }}
      />
      <VeSDLWrongNetworkModal />
    </Container>
  )
}

function FarmListHeader(): JSX.Element {
  const { t } = useTranslation()
  const theme = useTheme()
  const isLgDown = useMediaQuery(theme.breakpoints.down("lg"))
  return (
    <Grid
      container
      direction="row"
      sx={{
        py: 1,
        px: 3,
      }}
    >
      <Grid item xs={7} lg={3.5}>
        <Typography>{t("farms")}</Typography>
      </Grid>
      <Grid item xs={3}>
        <Typography>APR</Typography>
      </Grid>
      {!isLgDown && (
        <Grid item xs={1.5}>
          <Typography>Gauge TVL</Typography>
        </Grid>
      )}
      {!isLgDown && (
        <Grid item xs={1.5}>
          <Typography>{t("myStaked")} LP</Typography>
        </Grid>
      )}
    </Grid>
  )
}
