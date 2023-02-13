import { Box, Button, Paper, Stack, Typography } from "@mui/material"
import React, { ReactElement, useCallback, useContext } from "react"
import { commify, formatBNToString } from "../utils"

import { BigNumber } from "@ethersproject/bignumber"
import { ChainId } from "../constants/networks"
import { IS_SDL_LIVE } from "../constants"
import { LiquidityGaugeV5 } from "../../types/ethers-contracts/LiquidityGaugeV5"
import { UserStateContext } from "../providers/UserStateProvider"
import { Zero } from "@ethersproject/constants"
import { areGaugesActive } from "../utils/gauges"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { enqueuePromiseToast } from "./Toastify"
import { useActiveWeb3React } from "../hooks"
import { useLPTokenContract } from "../hooks/useContract"
import { useRewardsHelpers } from "../hooks/useRewardsHelpers"
import { useTranslation } from "react-i18next"

type Props = {
  liquidityGaugeContract?: LiquidityGaugeV5 | undefined | null
  lpWalletBalance: BigNumber
  poolName: string
  gaugeAddress?: string
}
export default function MyFarm({
  liquidityGaugeContract,
  lpWalletBalance,
  poolName,
  gaugeAddress,
}: Props): ReactElement | null {
  const {
    approveAndStake,
    claimSPA,
    unstakeMinichef,
    amountStakedMinichef,
    amountOfSpaClaimable,
    isPoolIncentivized,
  } = useRewardsHelpers(poolName)
  const lpTokenContract = useLPTokenContract(poolName)
  const userState = useContext(UserStateContext)
  const gaugeBalance =
    userState?.gaugeRewards?.[gaugeAddress ?? ""]?.amountStaked || Zero
  const { account, chainId } = useActiveWeb3React()
  const { t } = useTranslation()
  const formattedLpWalletBalance = commify(
    formatBNToString(lpWalletBalance, 18, 4),
  )
  const formattedLpStakedBalance = commify(
    formatBNToString(amountStakedMinichef, 18, 4),
  )
  const formattedLiquidityGaugeLpStakedBalance = commify(
    formatBNToString(gaugeBalance, 18, 4),
  )
  const formattedSpaClaimableBalance = commify(
    formatBNToString(amountOfSpaClaimable, 18, 4),
  )

  const gaugesAreActive = areGaugesActive(chainId)

  const onUnstakeClick = useCallback(async () => {
    if (!liquidityGaugeContract || !account || !chainId) return
    const txn = await liquidityGaugeContract["withdraw(uint256)"](
      await liquidityGaugeContract.balanceOf(account),
    )
    await enqueuePromiseToast(chainId, txn.wait(), "unstake", {
      poolName,
    })
  }, [account, chainId, liquidityGaugeContract, poolName])

  const onStakeClick = useCallback(async () => {
    if (!liquidityGaugeContract || !lpTokenContract || !account || !chainId)
      return
    await checkAndApproveTokenForTrade(
      lpTokenContract,
      liquidityGaugeContract.address,
      account,
      await lpTokenContract.balanceOf(account),
      true,
      Zero, // @dev: gas not being used
      {
        onTransactionError: () => {
          throw new Error("Your transaction could not be completed")
        },
      },
      chainId,
    )
    const txn = await liquidityGaugeContract["deposit(uint256,address,bool)"](
      await lpTokenContract.balanceOf(account),
      account,
      true,
    )
    await enqueuePromiseToast(chainId, txn.wait(), "stake", {
      poolName,
    })
  }, [account, chainId, liquidityGaugeContract, lpTokenContract, poolName])

  return isPoolIncentivized && IS_SDL_LIVE ? (
    <Paper sx={{ flex: 1 }}>
      <Stack spacing={2} p={4}>
        <Typography variant="h1">
          {gaugesAreActive ? t("myGaugeFarm") : t("myFarm")}
        </Typography>
        <Box display="flex" alignItems="center">
          <Box flex={1}>
            <Typography>{t("lpAvailable")}</Typography>
            <Typography variant="subtitle1" data-testid="myFarmLpBalance">
              {formattedLpWalletBalance}
            </Typography>
          </Box>
          <Box flex={1}>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              disabled={lpWalletBalance.isZero()}
              onClick={
                gaugesAreActive
                  ? () => void onStakeClick()
                  : () => void approveAndStake(lpWalletBalance)
              }
            >
              {t("stakeAll")}
            </Button>
          </Box>
        </Box>
        <Box display="flex" alignItems="center">
          <Box flex={1}>
            <Typography>{t("lpStaked")}</Typography>
            <Typography variant="subtitle1">
              {gaugesAreActive
                ? formattedLiquidityGaugeLpStakedBalance
                : formattedLpStakedBalance}
            </Typography>
          </Box>
          <Box flex={1}>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              disabled={
                gaugesAreActive
                  ? gaugeBalance.isZero()
                  : amountStakedMinichef.isZero()
              }
              onClick={
                gaugesAreActive
                  ? () => void onUnstakeClick()
                  : () => void unstakeMinichef(amountStakedMinichef)
              }
            >
              {t("unstakeAll")}
            </Button>
          </Box>
        </Box>
        {gaugesAreActive && amountStakedMinichef.gt(Zero) && (
          <Box display="flex" alignItems="center">
            <Box flex={1}>
              <Typography>{t("outdatedLpStaked")}</Typography>
              <Typography variant="subtitle1">
                {formattedLpStakedBalance}
              </Typography>
            </Box>
            <Box flex={1}>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                fullWidth
                disabled={amountStakedMinichef.isZero()}
                onClick={() => void unstakeMinichef(amountStakedMinichef)}
              >
                {t("unstake")}
              </Button>
            </Box>
          </Box>
        )}
        {chainId === ChainId.ARBITRUM && amountOfSpaClaimable.gt(Zero) && (
          <Box display="flex" alignItems="center">
            <Box flex={1}>
              <Typography>{t("claimableSPA")}</Typography>
              <Typography variant="subtitle1">
                {formattedSpaClaimableBalance}
              </Typography>
            </Box>
            <Box flex={1}>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                disabled={amountOfSpaClaimable.isZero()}
                onClick={() => void claimSPA()}
              >
                {t("claimAll")}
              </Button>
            </Box>
          </Box>
        )}
      </Stack>
    </Paper>
  ) : null
}
