import {
  Box,
  Button,
  DialogContent,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material"
import React, { useCallback, useState } from "react"
import { TRANSACTION_TYPES, readableDecimalNumberRegex } from "../../constants"
import { commify, formatBNToString, getContract } from "../../utils"
import { enqueuePromiseToast, enqueueToast } from "../../components/Toastify"
import { formatUnits, parseUnits } from "ethers/lib/utils"
import { useDispatch, useSelector } from "react-redux"

import { AppState } from "../../state"
import { BigNumber } from "ethers"
import Dialog from "../../components/Dialog"
import ERC20_ABI from "../../constants/abis/erc20.json"
import { Erc20 } from "../../../types/ethers-contracts/Erc20"
import TokenInput from "../../components/TokenInput"
import checkAndApproveTokenForTrade from "../../utils/checkAndApproveTokenForTrade"
import { updateLastTransactionTimes } from "../../state/application"
import { useActiveWeb3React } from "../../hooks"
import useUserGauge from "../../hooks/useUserGauge"

interface StakeDialogProps {
  open: boolean
  onClose: () => void
  farmName?: string
  gaugeAddress?: string
}

const defaultInput = "0.0"
export default function StakeDialog({
  open,
  farmName,
  gaugeAddress,
  onClose,
}: StakeDialogProps): JSX.Element | null {
  const { chainId, account, library } = useActiveWeb3React()
  const userGauge = useUserGauge(gaugeAddress)
  const dispatch = useDispatch()
  const [stakeStatus, setStakeStatus] = useState<"stake" | "unstake">("stake")
  const [amountInput, setAmountInput] = useState<string>(defaultInput)
  const { infiniteApproval } = useSelector((state: AppState) => state.user)

  const onClickStake = useCallback(async () => {
    try {
      if (!userGauge || !chainId || !gaugeAddress || !account || !library)
        return
      const inputBN = parseUnits(amountInput)
      const lpTokenContract = getContract(
        userGauge.lpToken.address,
        ERC20_ABI,
        library,
        account,
      ) as Erc20
      await checkAndApproveTokenForTrade(
        lpTokenContract,
        gaugeAddress,
        account,
        inputBN,
        infiniteApproval,
        BigNumber.from(1),
        {
          onTransactionError: () => {
            throw new Error("Your transaction could not be completed")
          },
        },
        chainId,
      )
      const txn = await userGauge?.stake(inputBN)
      await enqueuePromiseToast(chainId, txn.wait(), "stake", {
        poolName: farmName,
      })
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.STAKE_OR_CLAIM]: Date.now(),
        }),
      )
      setAmountInput(defaultInput)
    } catch (e) {
      console.error(e)
      enqueueToast("error", "Unable to stake")
    }
  }, [
    userGauge,
    chainId,
    gaugeAddress,
    account,
    library,
    amountInput,
    infiniteApproval,
    farmName,
    dispatch,
  ])

  const onClickUnstake = useCallback(async () => {
    try {
      if (!userGauge || !chainId) return
      const inputBN = parseUnits(amountInput)
      const txn = await userGauge?.unstake(inputBN)
      await enqueuePromiseToast(chainId, txn.wait(), "unstake", {
        poolName: farmName,
      })
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.STAKE_OR_CLAIM]: Date.now(),
        }),
      )
      setAmountInput(defaultInput)
    } catch (e) {
      console.error(e)
      enqueueToast("error", "Unable to unstake")
    }
  }, [userGauge, amountInput, chainId, farmName, dispatch])

  const onClickClaim = useCallback(async () => {
    if (!chainId) return
    try {
      const txns = await userGauge?.claim()

      await enqueuePromiseToast(
        chainId,
        Promise.all((txns || []).map((txn) => txn.wait())),
        "claim",
        { poolName: farmName },
      )
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.STAKE_OR_CLAIM]: Date.now(),
        }),
      )
    } catch (e) {
      console.error(e)
      enqueueToast("error", "Unable to claim reward")
    }
  }, [chainId, farmName, userGauge, dispatch])

  const isInputValid =
    readableDecimalNumberRegex.test(amountInput) && parseFloat(amountInput) > 0

  if (!userGauge) return null

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose()
        setStakeStatus("stake")
      }}
      fullWidth
      maxWidth="xs"
    >
      <DialogContent sx={{ mt: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h1" textAlign="center">
            {farmName}
          </Typography>
          <Typography>
            Stake your LP token and collect SDL incentives.
          </Typography>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography>LP Staked</Typography>
              {commify(
                formatBNToString(
                  userGauge.userStakedLpTokenBalance,
                  userGauge.lpToken.decimals,
                  4,
                ),
              )}
            </Box>
            {/* <Box>
              <Typography>Rewards</Typography>
              12334578.12
            </Box> */}
            <Button
              variant="outlined"
              size="large"
              onClick={onClickClaim}
              disabled={!userGauge.hasClaimableRewards}
            >
              Claim Rewards
            </Button>
          </Stack>
          <Tabs
            value={stakeStatus}
            variant="fullWidth"
            onChange={(_, newValue) => {
              setStakeStatus(newValue)
              setAmountInput(defaultInput)
            }}
          >
            <Tab value="stake" label="Stake" />
            <Tab value="unstake" label="Unstake" />
          </Tabs>
          <TokenInput
            inputValue={amountInput}
            token={userGauge.lpToken}
            max={commify(
              formatUnits(
                stakeStatus === "stake"
                  ? userGauge.userWalletLpTokenBalance
                  : userGauge.userStakedLpTokenBalance,
                userGauge.lpToken.decimals,
              ),
            )}
            showUSDprice={false}
            onChange={setAmountInput}
          />
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={!isInputValid}
            onClick={stakeStatus === "stake" ? onClickStake : onClickUnstake}
          >
            {stakeStatus === "stake" ? "Stake" : "Unstake"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
