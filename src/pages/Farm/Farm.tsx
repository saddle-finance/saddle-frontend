import { Container, Grid, Typography } from "@mui/material"
import React, { useCallback, useContext, useState } from "react"

import { AppState } from "../../state"
import { AprsContext } from "../../providers/AprsProvider"
import { BN_1E18 } from "../../constants"
import { BasicPoolsContext } from "../../providers/BasicPoolsProvider"
import { BigNumber } from "ethers"
import ClaimRewardsDlg from "./ClaimRewardsDlg"
import FarmOverview from "./FarmOverview"
import { GaugeContext } from "../../providers/GaugeProvider"
import StakeDialog from "./StakeDialog"
import { TokensContext } from "../../providers/TokensProvider"
import { UserStateContext } from "../../providers/UserStateProvider"
import { Zero } from "@ethersproject/constants"
import { getPriceDataForPool } from "../../utils"
import { parseUnits } from "@ethersproject/units"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

type ActiveGauge = {
  address: string
  displayName: string
}
const sushiGaugeName = "SLP-gauge"
export default function Farm(): JSX.Element {
  const [activeGauge, setActiveGauge] = useState<ActiveGauge | undefined>()
  const [openClaim, setOpenClaim] = useState<boolean>(false)
  const { gauges } = useContext(GaugeContext)
  const gaugeAprs = useContext(AprsContext)
  const userState = useContext(UserStateContext)
  const getGaugeTVL = useGaugeTVL()

  return (
    <Container sx={{ pt: 5 }}>
      <FarmListHeader />

      {Object.values(gauges)
        .filter(({ gaugeName }) => gaugeName?.includes("SLP"))
        .map((gauge) => {
          const farmName =
            gauge.gaugeName === sushiGaugeName
              ? "SDL/WETH SLP"
              : gauge.poolName || gauge.gaugeName || ""
          const gaugeAddress = gauge.address
          const poolName = gauge.poolName
          const aprs = gaugeAprs?.[gaugeAddress]
          const myStake = userState?.gaugeRewards?.[gaugeAddress]?.amountStaked
          const tvl = getGaugeTVL(gaugeAddress)
          return {
            gauge,
            gaugeAddress,
            farmName,
            poolName,
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
          return a.tvl.gt(b.tvl) ? -1 : 1
        })
        .map(({ gaugeAddress, farmName, aprs, tvl, myStake, poolName }) => {
          return (
            <FarmOverview
              farmName={farmName}
              poolName={poolName}
              aprs={aprs}
              tvl={tvl}
              myStake={myStake}
              key={gaugeAddress}
              onClickStake={() =>
                setActiveGauge({
                  address: gaugeAddress,
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
      <ClaimRewardsDlg open={openClaim} onClose={() => setOpenClaim(false)} />
    </Container>
  )
}

function useGaugeTVL(): (gaugeAddress?: string) => BigNumber {
  const { gauges } = useContext(GaugeContext)
  const { sdlWethSushiPool, tokenPricesUSD } = useSelector(
    (state: AppState) => state.application,
  )
  const basicPools = useContext(BasicPoolsContext)
  const tokens = useContext(TokensContext)

  return useCallback(
    (gaugeAddress?: string): BigNumber => {
      if (!gaugeAddress) return Zero
      const gauge = Object.values(gauges).find(
        (gauge) => gauge.address === gaugeAddress,
      )
      const basicPool = basicPools?.[gauge?.poolName || ""]
      if (gauge?.gaugeName === sushiGaugeName) {
        // special case for the sdl/weth pair
        return sdlWethSushiPool?.wethReserve
          ? sdlWethSushiPool.wethReserve // 1e18
              .mul(parseUnits(String(tokenPricesUSD?.["ETH"] || "0.0"), 3)) // 1e18 * 1e3 = 1e21
              .mul(2)
              .div(1e3) // 1e21 / 1e3 = 1e18
          : Zero
      }
      if (basicPool && gauge) {
        const { lpTokenPriceUSD } = getPriceDataForPool(
          tokens,
          basicPool,
          tokenPricesUSD,
        )
        return lpTokenPriceUSD.mul(gauge.gaugeTotalSupply || Zero).div(BN_1E18)
      }
      return Zero
    },
    [sdlWethSushiPool?.wethReserve, tokenPricesUSD, tokens, basicPools, gauges],
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
      <Grid item xs={3.5}>
        <Typography>{t("farms")}</Typography>
      </Grid>
      <Grid item xs={3}>
        <Typography>APR</Typography>
      </Grid>
      <Grid item xs={1.5}>
        <Typography>TVL</Typography>
      </Grid>
      <Grid item xs={1.5}>
        <Typography>{t("myStaked")} LP</Typography>
      </Grid>
    </Grid>
  )
}
