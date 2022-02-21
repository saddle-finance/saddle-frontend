import { Box, Button, Paper, Stack, Typography } from "@mui/material"
import { ChainId, IS_SDL_LIVE, PoolName } from "../constants"
import React, { ReactElement } from "react"
import { commify, formatBNToString } from "../utils"

import { BigNumber } from "@ethersproject/bignumber"
import { Zero } from "@ethersproject/constants"
import { useActiveWeb3React } from "../hooks"
import { useRewardsHelpers } from "../hooks/useRewardsHelpers"
import { useTranslation } from "react-i18next"

type Props = {
  lpWalletBalance: BigNumber
  poolName: string
}
export default function MyFarm({
  lpWalletBalance,
  poolName,
}: Props): ReactElement | null {
  const {
    approveAndStake,
    claimSPA,
    unstake,
    amountStaked,
    amountOfSpaClaimable,
    isPoolIncentivized,
  } = useRewardsHelpers(poolName as PoolName)
  const { chainId } = useActiveWeb3React()
  const { t } = useTranslation()
  const formattedLpWalletBalance = commify(
    formatBNToString(lpWalletBalance, 18, 4),
  )
  const formattedLpStakedBalance = commify(
    formatBNToString(amountStaked, 18, 4),
  )
  const formattedSpaClaimableBalance = commify(
    formatBNToString(amountOfSpaClaimable, 18, 4),
  )
  return isPoolIncentivized && IS_SDL_LIVE ? (
    <Paper>
      <Stack spacing={2} p={4}>
        <Typography variant="h1">{t("myFarm")}</Typography>
        <Box display="flex" alignItems="center">
          <Box flex={1}>
            <Typography>{t("lpAvailable")}</Typography>
            <Typography variant="subtitle1">
              {formattedLpWalletBalance}
            </Typography>
          </Box>
          <Box flex={1}>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              disabled={lpWalletBalance.isZero()}
              onClick={() => approveAndStake(lpWalletBalance)}
            >
              {t("stakeAll")}
            </Button>
          </Box>
        </Box>
        <Box display="flex" alignItems="center">
          <Box flex={1}>
            <Typography>{t("lpStaked")}</Typography>
            <Typography variant="subtitle1">
              {formattedLpStakedBalance}
            </Typography>
          </Box>
          <Box flex={1}>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              disabled={amountStaked.isZero()}
              onClick={() => unstake(amountStaked)}
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
