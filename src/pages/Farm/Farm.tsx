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
import VeSDLWrongNetworkModal from "../VeSDL/VeSDLWrongNetworkModal"
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
  const [activeDialog, setActiveDialog] = useState<
    "stake" | "claim" | undefined
  >()
  const basicPools = useContext(BasicPoolsContext)
  const { gauges } = useContext(GaugeContext)
  const gaugeAprs = useContext(AprsContext)
  const userState = useContext(UserStateContext)
  const getGaugeTVL = useGaugeTVL()

  return (
    <Container sx={{ pt: 5 }}>
      <FarmListHeader />

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

      if (gauge && gauge.gaugeName === sushiGaugeName) {
        // special case for the sdl/weth pair
        const poolTVL = sdlWethSushiPool?.wethReserve
          ? sdlWethSushiPool.wethReserve // 1e18
              .mul(parseUnits(String(tokenPricesUSD?.["ETH"] || "0.0"), 3)) // 1e18 * 1e3 = 1e21
              .mul(2)
              .div(1e3) // 1e21 / 1e3 = 1e18
          : Zero
        const lpTokenPriceUSD = sdlWethSushiPool?.totalSupply.gt(0)
          ? poolTVL.mul(BN_1E18).div(sdlWethSushiPool.totalSupply)
          : Zero
        return lpTokenPriceUSD.mul(gauge.gaugeTotalSupply || Zero).div(BN_1E18)
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
    [gauges, basicPools, sdlWethSushiPool, tokenPricesUSD, tokens],
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
        <Typography>Gauge TVL</Typography>
      </Grid>
      <Grid item xs={1.5}>
        <Typography>{t("myStaked")} LP</Typography>
      </Grid>
    </Grid>
  )
}
