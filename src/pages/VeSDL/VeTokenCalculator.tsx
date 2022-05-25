import {
  DialogContent,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import React, { useContext, useEffect, useState } from "react"
import { calculateWorkingAmount, formatBNToString } from "../../utils"
import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { BasicPoolsContext } from "../../providers/BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import CalculateIcon from "@mui/icons-material/Calculate"
import Dialog from "../../components/Dialog"
import { Zero } from "@ethersproject/constants"
import { parseEther } from "@ethersproject/units"
import { readableDecimalNumberRegex } from "../../constants"
import usePoolData from "../../hooks/usePoolData"
import { useTranslation } from "react-i18next"

type Props = {
  open: boolean
  onClose: () => void
  userBalanceVeSdl: BigNumber
  totalSupplyVeSdl: BigNumber
}
const MAX_BOOST = "2.5"
export default function VeTokenCalculator({
  open,
  onClose,
  totalSupplyVeSdl,
  userBalanceVeSdl,
}: Props): JSX.Element {
  const { t } = useTranslation()
  const basicPools = useContext(BasicPoolsContext)
  const [poolNameValue, setPoolNameValue] = useState<string>("D4")
  const [userVeSdlInputAmount, setUserVeSdlInputAmount] =
    useState<BigNumber>(Zero)
  const [poolData, userShare, setPoolDataName] = usePoolData("D4")

  const userVeSdlAmount = userVeSdlInputAmount.isZero()
    ? userBalanceVeSdl
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
    parseEther(MAX_BOOST).mul(workingAmount).div(userLPAmount)

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
            {basicPools &&
              Object.keys(basicPools)?.map((poolName) => (
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
          <Typography>
            {t("maxBoost")}: {MAX_BOOST}
          </Typography>
          <Typography>
            <CalculateIcon
              color="primary"
              sx={{ verticalAlign: "text-bottom", mr: 0.5 }}
            />
            <Typography component="span" mr={1}>
              {t("veSdlMaxBoost")}:
            </Typography>
            {veSdlForMaxBoost
              ? formatBNToString(veSdlForMaxBoost, 18)
              : t("minVeSDLForMaxBoost")}
          </Typography>
          <Divider />
          <Typography variant="subtitle1">{t("myBoostCalculator")}</Typography>
          <TextField
            label="My veSDL Amount"
            value={formatBNToString(
              userVeSdlInputAmount.isZero()
                ? userBalanceVeSdl
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
              sx={{ verticalAlign: "text-bottom", mr: 0.5 }}
            />
            {t("boost")}:
            <Typography component="span" color="primary" ml={1}>
              {boost ? formatBNToString(boost, 18) : "1.0x"}
            </Typography>
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
