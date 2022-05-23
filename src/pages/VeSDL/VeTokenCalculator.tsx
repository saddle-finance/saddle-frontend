import {
  DialogContent,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { POOLS_MAP, readableDecimalNumberRegex } from "../../constants"
import React, { useEffect, useState } from "react"
import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { BigNumber } from "@ethersproject/bignumber"
import CalculateIcon from "@mui/icons-material/Calculate"
import Dialog from "../../components/Dialog"
import { Zero } from "@ethersproject/constants"
import { formatBNToString } from "../../utils"
import { minBigNumber } from "../../utils/minBigNumber"
import { parseEther } from "@ethersproject/units"
import usePoolData from "../../hooks/usePoolData"
import { useTranslation } from "react-i18next"

type Props = {
  open: boolean
  onClose: () => void
  userBalaceVeSDL: BigNumber
  totalSupplyVeSDL: BigNumber
}
const MULTIPLIER = 100000
const MAXBOOST = 2.5
export default function VeTokenCalculator({
  open,
  onClose,
  totalSupplyVeSDL,
  userBalaceVeSDL,
}: Props): JSX.Element {
  const { t } = useTranslation()
  const [poolName, setPoolName] = useState<string>("D4")
  const [userVeSdlAmountInput, setUserVeSdlAmountInput] =
    useState<BigNumber>(Zero)
  const [poolData, userShare, setPoolDataName] = usePoolData("D4")

  const userVeSdlAmount = userVeSdlAmountInput.isZero()
    ? userBalaceVeSDL
    : userVeSdlAmountInput

  const userLPAmount = userShare?.usdBalance || Zero

  const veSdlForMaxBoost =
    poolData?.reserve?.gt(Zero) &&
    userShare?.usdBalance.mul(totalSupplyVeSDL).div(poolData.reserve)

  const calculateWorkingAmount = (
    userLPAmount: BigNumber,
    totalLPDeposit: BigNumber,
    userBalanceVeSDL: BigNumber,
    totalSupplyVeSDL: BigNumber,
  ) => {
    let minAmount = userLPAmount.mul(BigNumber.from(3)).div(BigNumber.from(4))
    if (totalSupplyVeSDL.gt(Zero)) {
      minAmount = minAmount?.add(
        totalLPDeposit
          .mul(userBalanceVeSDL)
          .div(totalSupplyVeSDL)
          .mul(BigNumber.from(60).div(BigNumber.from(100))),
      )
    }
    return minAmount && minBigNumber(minAmount, userLPAmount)
  }

  const workingAmount =
    poolData.reserve &&
    calculateWorkingAmount(
      userLPAmount,
      poolData.reserve,
      userVeSdlAmount,
      totalSupplyVeSDL,
    )

  const boost =
    workingAmount &&
    BigNumber.from(MAXBOOST * MULTIPLIER)
      .mul(workingAmount)
      .div(userLPAmount)

  useEffect(() => {
    if (setPoolDataName) setPoolDataName(poolName)
  }, [poolName])

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogContent sx={{ p: 4 }}>
        <Typography variant="h3" pb={4}>
          {t("veSdlCalculator")}
        </Typography>
        <Stack direction="column" spacing={3}>
          <TextField
            label={t("totalVeSdl")}
            value={formatBNToString(totalSupplyVeSDL, 18)}
            fullWidth
          />
          <Divider />
          <Typography variant="subtitle1">{t("maxBoostCalculator")}</Typography>

          <TextField
            variant="standard"
            value={poolName}
            placeholder={t("selectPoolName")}
            onChange={(e) => setPoolName(e.target.value)}
            select
            SelectProps={{ IconComponent: ArrowDownIcon }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {Object.keys(POOLS_MAP).map((poolName) => (
              <MenuItem key={poolName} value={poolName}>
                {poolName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t("poolLiquidity")}
            value={
              poolData.reserve ? formatBNToString(poolData.reserve, 18) : ""
            }
          />
          <TextField
            label={t("depositAmount")}
            value={userShare ? formatBNToString(userShare?.usdBalance, 18) : ""}
          />
          <Typography>
            {t("maxBoost")}:{"..."}
          </Typography>
          <Typography>
            <CalculateIcon
              color="primary"
              sx={{ verticalAlign: "text-bottom", mr: 1 }}
            />
            {t("veSdlMaxBoost")}:{" "}
            {veSdlForMaxBoost ? formatBNToString(veSdlForMaxBoost, 18) : "..."}
          </Typography>
          <Divider />
          <Typography variant="subtitle1">{t("myBoostCalculator")}</Typography>
          <TextField
            label="My veSDL Amount"
            value={formatBNToString(
              userVeSdlAmountInput.isZero()
                ? userBalaceVeSDL
                : userVeSdlAmountInput,
              18,
            )}
            onChange={(e) =>
              readableDecimalNumberRegex.test(e.target.value) &&
              setUserVeSdlAmountInput(parseEther(e.target.value.trim() || "0"))
            }
            fullWidth
          />
          <Typography>
            <CalculateIcon
              color="primary"
              sx={{ verticalAlign: "text-bottom", mr: 1 }}
            />
            {t("boost")}:
            <Typography component="span" color="primary" ml={1}>
              {boost && boost.toNumber() / MULTIPLIER} (0 veSDL)
            </Typography>
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
