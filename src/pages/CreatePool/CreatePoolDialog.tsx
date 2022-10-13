import {
  Alert,
  Box,
  Button,
  DialogContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material"
import { BigNumber, BigNumberish, ethers } from "ethers"
import { PoolType, ValidationStatus } from "."
import React, { useState } from "react"
import { enqueuePromiseToast, enqueueToast } from "../../components/Toastify"

import Dialog from "../../components/Dialog"
import DialogTitle from "../../components/DialogTitle"
import { PoolTypes } from "../../constants"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "../../hooks"
import { usePermissionlessDeployer } from "../../hooks/useContract"
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
    assetType: PoolTypes
    tokenInputs: string[]
    tokenInfo: {
      name: string
      symbol: string
      decimals: BigNumberish
      checkResult: ValidationStatus
    }[]
  }
  resetFields: () => void
  metapoolBasepoolAddr: string
  metapoolBasepoolLpAddr: string
}

export default function ReviewCreatePool({
  open,
  onClose = () => null,
  poolData,
  resetFields,
  metapoolBasepoolAddr,
  metapoolBasepoolLpAddr,
}: Props): JSX.Element {
  const { t } = useTranslation()
  const permissionlessDeployer = usePermissionlessDeployer()
  const { account, chainId, library } = useActiveWeb3React()
  const [isPoolDeploying, setIsPoolDeploying] = useState<boolean>(false)

  const onCreatePoolClick = async () => {
    if (!library || !chainId || !account || !permissionlessDeployer) return
    setIsPoolDeploying(true)

    const enqueueCreatePoolToast = async (deployTxn: {
      wait: () => Promise<unknown>
    }) =>
      await enqueuePromiseToast(
        chainId,
        deployTxn.wait(),
        "createPermissionlessPool",
        {
          poolName: poolData.poolName,
        },
      )

    const decimals = poolData.tokenInfo.map((token) => token.decimals)
    const deploySwapInput = {
      poolName: ethers.utils.formatBytes32String(poolData.poolName),
      tokens: poolData.tokenInputs,
      decimals,
      adminFee: BigNumber.from(parseUnits("50", 8)), // 50%
      lpTokenSymbol: poolData.poolSymbol,
      a: BigNumber.from(poolData.aParameter),
      fee: BigNumber.from(parseUnits(poolData.fee, 8)),
      owner: account,
      typeOfAsset: poolData.assetType,
    }
    let deployTxn

    try {
      if (poolData.poolType === PoolType.Base) {
        deployTxn = await permissionlessDeployer.deploySwap(deploySwapInput)
        await enqueueCreatePoolToast(deployTxn)
      } else {
        const deployMetaSwapInput = {
          ...deploySwapInput,
          baseSwap: metapoolBasepoolAddr,
          tokens: [...poolData.tokenInputs, metapoolBasepoolLpAddr],
          decimals: [...deploySwapInput.decimals, 18],
        }
        deployTxn = await permissionlessDeployer.deployMetaSwap(
          deployMetaSwapInput,
        )
        await enqueueCreatePoolToast(deployTxn)
      }
      resetFields()
    } catch (err) {
      console.error({ err })
      const er = err as { error: { data: { message: string } } }
      if (
        er.error.data.message.includes(
          "SafeERC20: approve from non-zero to non-zero allowance",
        )
      ) {
        enqueueToast(
          "error",
          "Unable to create pool with tokens that the base pool consists of",
        )
      } else {
        enqueueToast("error", "Unable to deploy Permissionless Pool")
      }
    } finally {
      setIsPoolDeploying(false)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle variant="h1">{t("reviewPoolCreation")}</DialogTitle>
      <DialogContent>
        <Alert icon={false} color="warning">
          {t("permissionlessPoolCreationWarningMsg")}
        </Alert>
        <Stack my={3} spacing={1}>
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("poolName")}</Typography>
            <Typography>{poolData?.poolName}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("poolSymbol")}</Typography>
            <Typography>{poolData?.poolSymbol}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("fee")}</Typography>
            <Typography>{poolData?.fee}%</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("aParameter")}</Typography>
            <Typography>{poolData?.aParameter}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("poolType")}</Typography>
            <Typography>{t(poolData?.poolType)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("tokens")}</Typography>
            <Typography>
              {poolData.tokenInfo.map((token) => token?.name).join(", ")}
            </Typography>
          </Box>
        </Stack>
        <Divider />
        <Typography my={3}>
          {t("permissionlessPoolCreationOutputEstimatedMsg")}
        </Typography>
        <Stack spacing={1}>
          <Button
            variant="contained"
            size="large"
            disabled={isPoolDeploying}
            onClick={() => void onCreatePoolClick()}
          >
            <Typography>{t("createPool")}</Typography>
          </Button>
          <Button onClick={onClose} size="large">
            <Typography>{t("goBackToEdit")}</Typography>
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
