import { Box, Button, Paper, Stack, Typography } from "@mui/material"
import { ChainId, IS_SDL_LIVE, PoolName } from "../constants"
import React, { ReactElement, useEffect, useState } from "react"
import { commify, formatBNToString } from "../utils"

import { BigNumber } from "@ethersproject/bignumber"
import { LiquidityGaugeV5 } from "../../types/ethers-contracts/LiquidityGaugeV5"
import { Zero } from "@ethersproject/constants"
import { enqueuePromiseToast } from "./Toastify"
import { useActiveWeb3React } from "../hooks"
import { useLPTokenContract } from "../hooks/useContract"
import { useRewardsHelpers } from "../hooks/useRewardsHelpers"
import { useTranslation } from "react-i18next"

type Props = {
  liquidityGaugeContract?: LiquidityGaugeV5 | undefined
  lpWalletBalance: BigNumber
  poolName: string
}
export default function MyFarm({
  liquidityGaugeContract,
  lpWalletBalance,
  poolName,
}: Props): ReactElement | null {
  const [userGaugeBalance, setUserGaugeBalance] = useState<BigNumber>(Zero)
  const {
    approveAndStake,
    claimSPA,
    unstake,
    amountStaked,
    amountOfSpaClaimable,
    isPoolIncentivized,
  } = useRewardsHelpers(poolName as PoolName)
  const lpTokenContract = useLPTokenContract(poolName as PoolName)
  const { account, chainId } = useActiveWeb3React()
  const { t } = useTranslation()
  const formattedLpWalletBalance = commify(
    formatBNToString(lpWalletBalance, 18, 4),
  )
  const formattedLpStakedBalance = commify(
    formatBNToString(amountStaked, 18, 4),
  )
  const formattedLiquidityGaugeLpStakedBalance = commify(
    formatBNToString(userGaugeBalance, 18, 4),
  )
  const formattedSpaClaimableBalance = commify(
    formatBNToString(amountOfSpaClaimable, 18, 4),
  )

  useEffect(() => {
    const fetchUserGaugeBalance = async () => {
      if (!liquidityGaugeContract || !account) return
      const userGaugeBalance = await liquidityGaugeContract.balanceOf(account)
      setUserGaugeBalance(userGaugeBalance)
    }
    void fetchUserGaugeBalance()
  }, [account, liquidityGaugeContract])

  const veSDLFeatureReady = false

  return isPoolIncentivized && IS_SDL_LIVE ? (
    <Paper sx={{ flex: 1 }}>
      <Stack spacing={2} p={4}>
        <Typography variant="h1">
          {veSDLFeatureReady ? t("myGaugeFarm") : t("myFarm")}
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
              // onClick={() => approveAndStake(lpWalletBalance)}
              onClick={
                veSDLFeatureReady
                  ? async () => {
                      if (
                        !liquidityGaugeContract ||
                        !lpTokenContract ||
                        !account ||
                        !chainId
                      )
                        return
                      const txn = await liquidityGaugeContract[
                        "deposit(uint256,address,bool)"
                      ](await lpTokenContract.balanceOf(account), account, true)
                      await enqueuePromiseToast(chainId, txn.wait(), "stake", {
                        poolName,
                      })
                    }
                  : () => approveAndStake(lpWalletBalance)
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
              {veSDLFeatureReady
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
                veSDLFeatureReady
                  ? userGaugeBalance.isZero()
                  : amountStaked.isZero()
              }
              // onClick={() => unstake(amountStaked)}
              onClick={
                veSDLFeatureReady
                  ? async () => {
                      if (!liquidityGaugeContract || !account || !chainId)
                        return
                      const txn = await liquidityGaugeContract[
                        "withdraw(uint256)"
                      ](await liquidityGaugeContract.balanceOf(account))
                      await enqueuePromiseToast(
                        chainId,
                        txn.wait(),
                        "unstake",
                        {
                          poolName,
                        },
                      )
                    }
                  : () => unstake(amountStaked)
              }
            >
              {t("unstakeAll")}
            </Button>
          </Box>
        </Box>
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
                onClick={() => claimSPA()}
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
