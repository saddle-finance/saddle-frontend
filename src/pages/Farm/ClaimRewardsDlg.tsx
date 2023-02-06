import {
  Box,
  Button,
  DialogContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material"
import React, { useCallback } from "react"
import { commify, formatBNToString } from "../../utils"
import { enqueuePromiseToast, enqueueToast } from "../../components/Toastify"

import { BigNumber } from "ethers"
import Dialog from "../../components/Dialog"
import { GaugeUserReward } from "../../utils/gauges"
import { TRANSACTION_TYPES } from "../../constants"
import { updateLastTransactionTimes } from "../../state/application"
import { useActiveWeb3React } from "../../hooks"
import { useDispatch } from "react-redux"
import useUserGauge from "../../hooks/useUserGauge"

type Props = {
  open: boolean
  gaugeAddress?: string
  displayName?: string
  onClose: () => void
}

export default function ClaimRewardsDlg({
  open,
  onClose,
  gaugeAddress,
  displayName,
}: Props): JSX.Element {
  const { chainId } = useActiveWeb3React()
  const userGauge = useUserGauge()(gaugeAddress)
  const dispatch = useDispatch()

  const onClickClaim = useCallback(async () => {
    if (!chainId) {
      enqueueToast("error", "Unable to claim reward")
      return
    }
    const txns = await userGauge?.claim()
    await enqueuePromiseToast(
      chainId,
      Promise.all((txns || []).map((txn) => txn.wait())),
      "claim",
      { poolName: displayName },
    )
    dispatch(
      updateLastTransactionTimes({
        [TRANSACTION_TYPES.STAKE_OR_CLAIM]: Date.now(),
      }),
    )
  }, [chainId, userGauge, dispatch, displayName])

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent sx={{ mt: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h2" textAlign="center">
            Claim {displayName} Gauge Rewards
          </Typography>
          <Typography>Stake your LP token and collect incentives.</Typography>
          <Box>
            <Typography mt={2}>Rewards:</Typography>
            <UserRewards userGaugeRewards={userGauge?.userGaugeRewards} />
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={() => void onClickClaim()}
            disabled={!userGauge?.hasClaimableRewards}
          >
            Claim Rewards
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

function UserRewards({
  userGaugeRewards,
}: {
  userGaugeRewards?: GaugeUserReward | null
}) {
  if (!userGaugeRewards) return null
  const { claimableExternalRewards, claimableSDL } = userGaugeRewards
  const rewardItems: [string, BigNumber][] = [["SDL", claimableSDL]]
  claimableExternalRewards.forEach((reward) => {
    rewardItems.push([reward.token.symbol, reward.amount])
  })

  return (
    <Box sx={{ width: "100%" }}>
      {rewardItems.map((item, i) => {
        return (
          <React.Fragment key={item[0]}>
            <Box
              sx={{ justifyContent: "space-between", display: "flex", my: 1 }}
            >
              <Typography variant="subtitle1">{item[0]}</Typography>{" "}
              <Typography>
                {commify(formatBNToString(item[1], 18, 2))}
              </Typography>
            </Box>
            {i < rewardItems.length - 1 && <Divider />}
          </React.Fragment>
        )
      })}
    </Box>
  )
}
