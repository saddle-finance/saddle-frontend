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
import { commify, formatBNToString, getContract } from "../../utils"
import { formatUnits, parseUnits } from "ethers/lib/utils"

import { AppState } from "../../state"
import { BigNumber } from "ethers"
import Dialog from "../../components/Dialog"
import ERC20_ABI from "../../constants/abis/erc20.json"
import { Erc20 } from "../../../types/ethers-contracts/Erc20"
import TokenInput from "../../components/TokenInput"
import checkAndApproveTokenForTrade from "../../utils/checkAndApproveTokenForTrade"
import { enqueuePromiseToast } from "../../components/Toastify"
import { readableDecimalNumberRegex } from "../../constants"
import { useActiveWeb3React } from "../../hooks"
import { useSelector } from "react-redux"
import useUserGauge from "../../hooks/useUserGauge"

interface StakeDialogProps {
  open: boolean
  onClose: () => void
  farmName: string
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
  const [stakeStatus, setStakeStatus] = useState<"stake" | "unstake">("stake")
  const [amountInput, setAmountInput] = useState<string>(defaultInput)
  const { infiniteApproval } = useSelector((state: AppState) => state.user)

  const onClickStake = useCallback(async () => {
    // TODO clean up approval function
    // TODO dispatch updateLastTransactionTimes action
    if (!userGauge || !chainId || !gaugeAddress || !account || !library) return
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
    setAmountInput(defaultInput)
  }, [
    userGauge,
    chainId,
    gaugeAddress,
    account,
    library,
    amountInput,
    infiniteApproval,
    farmName,
  ])

  const onClickUnstake = useCallback(async () => {
    if (!userGauge || !chainId) return
    const inputBN = parseUnits(amountInput)
    const txn = await userGauge?.stake(inputBN)
    await enqueuePromiseToast(chainId, txn.wait(), "unstake", {
      poolName: farmName,
    })
    setAmountInput(defaultInput)
  }, [userGauge, amountInput, chainId, farmName])

  const isInputValid =
    readableDecimalNumberRegex.test(amountInput) && parseFloat(amountInput) > 0

  if (!userGauge) return null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
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
            </Box>
            <Button variant="outlined" size="large">
              Claim
            </Button> */}
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
