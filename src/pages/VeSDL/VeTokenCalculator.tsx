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
import { calculateWorkingAmount, formatBNToString } from "../../utils"
import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { BigNumber } from "@ethersproject/bignumber"
import CalculateIcon from "@mui/icons-material/Calculate"
import Dialog from "../../components/Dialog"
import { Zero } from "@ethersproject/constants"
import { parseEther } from "@ethersproject/units"
import usePoolData from "../../hooks/usePoolData"
import { useTranslation } from "react-i18next"

type Props = {
  open: boolean
  onClose: () => void
  userBalaceVeSdl: BigNumber
  totalSupplyVeSdl: BigNumber
}
const MAXBOOST = "2.5"
export default function VeTokenCalculator({
  open,
  onClose,
  totalSupplyVeSdl,
  userBalaceVeSdl,
}: Props): JSX.Element {
  const { t } = useTranslation()
  const [poolNameValue, setPoolNameValue] = useState<string>("D4")
  const [userVeSdlInputAmount, setUserVeSdlInputAmount] =
    useState<BigNumber>(Zero)
  const [poolData, userShare, setPoolDataName] = usePoolData("D4")

  const userVeSdlAmount = userVeSdlInputAmount.isZero()
    ? userBalaceVeSdl
    : userVeSdlInputAmount

  const userLPAmount = userShare?.usdBalance || Zero
  const totalLPAmount = poolData.reserve || Zero

  const workingAmount = calculateWorkingAmount(
    userLPAmount,
    totalLPAmount,
    userVeSdlAmount,
    totalSupplyVeSdl,
  )
  const veSdlForMaxBoost =
    totalLPAmount.gt(Zero) &&
    userLPAmount.mul(totalSupplyVeSdl).div(totalLPAmount)
  const boost =
    userLPAmount.gt(Zero) &&
    parseEther(MAXBOOST).mul(workingAmount).div(userLPAmount)

  useEffect(() => {
    setPoolDataName(poolNameValue)
  }, [poolNameValue, setPoolDataName])

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogContent sx={{ p: 4 }}>
        <Typography variant="h3" pb={4}>
          {t("veSdlCalculator")}
        </Typography>
        <Stack direction="column" spacing={3}>
          <TextField
            label={t("totalVeSdl")}
            value={formatBNToString(totalSupplyVeSdl, 18)}
            fullWidth
          />
          <Divider />
          <Typography variant="subtitle1">{t("maxBoostCalculator")}</Typography>

          <TextField
            variant="standard"
            value={poolNameValue}
            placeholder={t("selectPoolName")}
            onChange={(e) => setPoolNameValue(e.target.value)}
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
            value={formatBNToString(totalLPAmount, 18)}
          />
          <TextField
            label={t("depositAmount")}
            value={userShare ? formatBNToString(userShare?.usdBalance, 18) : ""}
          />
          <Typography>{t("maxBoost")}: 2.5</Typography>
          <Typography>
            <CalculateIcon
              color="primary"
              sx={{ verticalAlign: "text-bottom", mr: 1 }}
            />
            {t("veSdlMaxBoost")}:
            {veSdlForMaxBoost ? formatBNToString(veSdlForMaxBoost, 18) : "..."}
          </Typography>
          <Divider />
          <Typography variant="subtitle1">{t("myBoostCalculator")}</Typography>
          <TextField
            label="My veSDL Amount"
            value={formatBNToString(
              userVeSdlInputAmount.isZero()
                ? userBalaceVeSdl
                : userVeSdlInputAmount,
              18,
            )}
            onChange={(e) =>
              readableDecimalNumberRegex.test(e.target.value) &&
              setUserVeSdlInputAmount(parseEther(e.target.value.trim() || "0"))
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
              {boost ? formatBNToString(boost, 18) : "..."}
            </Typography>
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
