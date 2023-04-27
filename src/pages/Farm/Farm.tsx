import { BN_1E18, BN_DAY_IN_SECONDS } from "../../constants"
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import React, { useCallback, useContext, useEffect, useState } from "react"
import { enqueuePromiseToast, enqueueToast } from "../../components/Toastify"

import { AprsContext } from "../../providers/AprsProvider"
import { BasicPoolsContext } from "../../providers/BasicPoolsProvider"
import ClaimRewardsDlg from "./ClaimRewardsDlg"
import FarmOverview from "./FarmOverview"
import { GaugeContext } from "../../providers/GaugeProvider"
import { IS_DEVELOPMENT } from "../../utils/environment"
import StakeDialog from "./StakeDialog"
import { UserStateContext } from "../../providers/UserStateProvider"
import VeSDLWrongNetworkModal from "../VeSDL/VeSDLWrongNetworkModal"
import { Zero } from "@ethersproject/constants"
import { formatUnits } from "ethers/lib/utils"
import { getGaugeContract } from "../../hooks/useContract"
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
  const basicPools = useContext(BasicPoolsContext)
  const { gauges } = useContext(GaugeContext)
  const gaugeAprs = useContext(AprsContext)
  const userState = useContext(UserStateContext)
  // const [userFusdcBalance, setUserFusdcBalance] = useState(Zero)
  useEffect(() => {
    console.log(userState)
  }, [userState])
  const getGaugeTVL = useGaugeTVL()
  const farmData = Object.values(gauges)
    .filter(({ isKilled }) => !isKilled)
    .map((gauge) => {
      const {
        poolName,
        gaugeTotalSupply,
        gaugeName,
        address,
        poolAddress,
        rewards,
      } = gauge
      const farmName =
        gaugeName === sushiGaugeName
          ? "SDL/WETH SLP"
          : poolName || gaugeName || ""
      const gaugeAddress = address
      const aprs = gaugeAprs?.[gaugeAddress]
      const myStake = // is this a bug?
        userState?.gaugeRewards?.[gaugeAddress]?.amountStaked || Zero
      const tvl = getGaugeTVL(gaugeAddress)
      const gaugePoolAddress = poolAddress
      const userShare = gaugeTotalSupply.gt(Zero)
        ? myStake.mul(BN_1E18).div(gaugeTotalSupply)
        : Zero
      const sdlReward = rewards[rewards.length - 1]
      const userSdlRewardRate = userShare
        .mul(sdlReward?.rate || Zero)
        .div(BN_1E18)

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
        userSdlRewardRate,
      } as const
    })
    .sort((a, b) => {
      // Put SLP gauge at top
      if (a.gauge.gaugeName === sushiGaugeName) {
        return -1
      }
      if (b.gauge.gaugeName === sushiGaugeName) {
        return 1
      }
      // Sort by highest user balance
      if (a.myStake.gt(b.myStake)) {
        return -1
      }
      if (b.myStake.gt(a.myStake)) {
        return 1
      }
      // Sort by gauge TVL
      return a.tvl.gt(b.tvl) ? -1 : 1
    })

  useEffect(() => {
    // TODO expose this to user once we have designs
    const userTotalRate = farmData.reduce(
      (sum, d) => sum.add(d.userSdlRewardRate),
      Zero,
    )
    const userDailyRate = userTotalRate.mul(BN_DAY_IN_SECONDS)
    if (IS_DEVELOPMENT && userDailyRate.gt(Zero)) {
      console.log("user SDL earned per day", formatUnits(userDailyRate, 18))
    }
  }, [farmData])

  return (
    <Container sx={{ pt: 5, pb: 5 }}>
      <FusdcUnstakeWarning />
      <Box
        position="sticky"
        top={0}
        bgcolor={(theme) => theme.palette.background.paper}
        zIndex={(theme) => theme.zIndex.mobileStepper - 1}
        py={2}
        sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        <FarmListHeader />
      </Box>

      <Box
        bgcolor={(theme) => theme.palette.background.paper}
        zIndex={(theme) => theme.zIndex.mobileStepper - 1}
        py={2}
        sx={{ borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}
      >
        {farmData.map(
          ({ gaugeAddress, farmName, aprs, poolTokens, tvl, myStake }) => {
            return (
              <Box key={gaugeAddress}>
                <Divider />
                <FarmOverview
                  farmName={farmName}
                  poolTokens={poolTokens}
                  aprs={aprs}
                  tvl={tvl}
                  myStake={myStake}
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
              </Box>
            )
          },
        )}
      </Box>

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

function FusdcUnstakeWarning(): JSX.Element | null {
  const { chainId, library, account } = useActiveWeb3React()
  const userState = useContext(UserStateContext)
  const fusdcGaugeAddress = "0xc7ec37b1e3be755e06a729e11a76ff4259768f12"
  const amountStaked =
    userState?.gaugeRewards?.[fusdcGaugeAddress]?.amountStaked || Zero

  const onClickUnstake = useCallback(async () => {
    if (account == null || chainId == null || library == null) {
      enqueueToast("error", "Unable to unstake")
      console.error("gauge not loaded")
      return
    }
    try {
      const gaugeContract = getGaugeContract(
        library,
        chainId,
        fusdcGaugeAddress,
        account,
      )
      const txn = await gaugeContract["withdraw(uint256)"](amountStaked)
      await enqueuePromiseToast(chainId, txn.wait(), "unstake", {
        poolName: "fUSDC outdated",
      })
      // dispatch(
      //   updateLastTransactionTimes({
      //     [TRANSACTION_TYPES.STAKE_OR_CLAIM]: Date.now(),
      //   }),
      // )
    } catch (e) {
      console.error(e)
      enqueueToast("error", "Unable to unstake")
    }
  }, [account, chainId, library, amountStaked])
  // if (userGauge == null) return null
  if (amountStaked.eq(Zero)) return null
  return (
    <Box
      position="sticky"
      top={0}
      bgcolor={(theme) => theme.palette.background.paper}
      zIndex={(theme) => theme.zIndex.mobileStepper - 1}
      py={2}
      px={3}
      sx={{ borderRadius: 16 }}
    >
      <Typography variant="subtitle1">
        You are staked in the outdated fUSDC gauge, please unstake and move to
        the new gauge
      </Typography>
      <Button
        variant="contained"
        color="warning"
        onClick={() => void onClickUnstake()}
      >
        Unstake
      </Button>
    </Box>
  )
}
