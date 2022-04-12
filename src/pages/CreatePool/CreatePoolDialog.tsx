import {
  Alert,
  Box,
  Button,
  DialogContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material"
import { AssetType, PoolType, TextFieldColors } from "."
import { enqueuePromiseToast, enqueueToast } from "../../components/Toastify"

import { BigNumberish } from "ethers"
import Dialog from "../../components/Dialog"
import DialogTitle from "../../components/DialogTitle"
import PERMISSIONLESS_DEPLOYER_CONTRACT_ABI from "../../constants/abis/permissionlessDeployer.json"
import { PermissionlessDeployer } from "../../../types/ethers-contracts/PermissionlessDeployer"
import React from "react"
import { Zero } from "@ethersproject/constants"
import { getContract } from "../../utils"
import { useActiveWeb3React } from "../../hooks"
import { useTranslation } from "react-i18next"

type Props = {
  open: boolean
  onClose?: () => void
  poolData: {
    poolName: string
    poolSymbol: string
    aParameter: string
    poolType: PoolType
    fee: string
    assetType: AssetType
    tokenInputs: string[]
    tokenInfo: {
      name: string
      symbol: string
      decimals: BigNumberish
      checkResult: TextFieldColors
    }[]
  }
}

export default function ReviewCreatePool({
  open,
  onClose = () => null,
  poolData,
}: Props): JSX.Element {
  const { t } = useTranslation()
  const { account, chainId, library } = useActiveWeb3React()

  const onCreatePoolClick = async () => {
    if (!library || !chainId || !account) return
    const permissionlessDeployerContract = getContract(
      // hardhat addr delete this later
      "0xD5ac451B0c50B9476107823Af206eD814a2e2580",
      PERMISSIONLESS_DEPLOYER_CONTRACT_ABI,
      library,
      account,
    ) as PermissionlessDeployer

    try {
      const txn = await permissionlessDeployerContract.deploySwap({
        poolName: poolData.poolName,
        tokens: poolData.tokenInputs,
        decimals: [Zero], // poolData.tokenInfo.decimals || Zero,
        lpTokenName: poolData.poolName,
        lpTokenSymbol: poolData.poolSymbol,
        a: poolData.aParameter,
        fee: poolData.fee,
        adminFee: Zero,
        owner: account,
        typeOfAsset: Zero,
      })
      await enqueuePromiseToast(chainId, txn.wait(), "create", {
        poolName: "Vesting Contract",
      })
      // resetFields()
    } catch (err) {
      console.error(err)
      enqueueToast("error", "Unable to deploy Permissionless Pool")
    }
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle variant="h1">Review Pool Creation</DialogTitle>
      <DialogContent>
        <Alert icon={false} color="warning">
          Double check the inputs for your pool are as you want it-- once a pool
          is created, it can be modified but cannot be deleted (it&lsquo;ll live
          on the blockchain forever!)
        </Alert>
        <Stack my={3} spacing={1}>
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("poolName")}</Typography>
            <Typography>{poolData.poolName}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("poolSymbol")}</Typography>
            <Typography>{poolData.poolSymbol}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("fee")}</Typography>
            <Typography>{poolData.fee}%</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("aParameter")}</Typography>
            <Typography>{poolData.aParameter}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("poolType")}</Typography>
            <Typography>{poolData.poolType}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>Tokens</Typography>
            <Typography>
              {poolData.tokenInfo.map(
                (token, i) => (i ? ", " : "") + token.name,
              )}
            </Typography>
          </Box>
        </Stack>
        <Divider />
        <Typography my={3}>
          Output is estimated. If the input is invalid or the gas is too low,
          your transaction will revert.
        </Typography>
        <Stack spacing={1}>
          <Button variant="contained" size="large" onClick={onCreatePoolClick}>
            Create Pool
          </Button>
          <Button onClick={onClose} size="large">
            Go back to edit
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
