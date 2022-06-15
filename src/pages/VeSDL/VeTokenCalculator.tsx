import {
  DialogContent,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import React, { useContext, useEffect, useState } from "react"
import { calculateWorkingAmountAndBoost, formatBNToString } from "../../utils"
import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { BasicPoolsContext } from "../../providers/BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import CalculateIcon from "@mui/icons-material/Calculate"
import Dialog from "../../components/Dialog"
import { GaugeContext } from "../../providers/GaugeProvider"
import { parseEther } from "@ethersproject/units"
import { readableDecimalNumberRegex } from "../../constants"
import { useTranslation } from "react-i18next"

type Props = {
  open: boolean
  onClose: () => void
  userBalanceVeSdl: BigNumber
  totalSupplyVeSdl: BigNumber
}

export default function VeTokenCalculator({
  open,
  onClose,
  totalSupplyVeSdl,
  userBalanceVeSdl,
}: Props): JSX.Element {
  const { t } = useTranslation()
  const basicPools = useContext(BasicPoolsContext)
  const gaugeData = useContext(GaugeContext)
  const [userLPAmountInput, setUserLPAmountInput] = useState<string>("")
  const [totalLPAmountInput, setTotalLPAmountInput] = useState<string>("")
  const [poolNameValue, setPoolNameValue] = useState<string>("D4")
  const [userVeSdlInputAmount, setUserVeSdlInputAmount] = useState<string>(
    userBalanceVeSdl.isZero() ? "" : formatBNToString(userBalanceVeSdl, 18),
  )
  const [totalVeSDLInput, setTotalVeSDLInput] = useState<string>(
    totalSupplyVeSdl.isZero() ? "" : formatBNToString(totalSupplyVeSdl, 18),
  )

  const pool = basicPools && basicPools[poolNameValue]
  const gauge =
    !!pool?.poolAddress && gaugeData.gauges
      ? gaugeData.gauges[pool.poolAddress]
      : undefined

  const userLPAmountBN = parseEther(userLPAmountInput || "0")
  const totalLPAmountBN = parseEther(totalLPAmountInput || "0")

  const boost =
    gauge &&
    calculateWorkingAmountAndBoost(
      userLPAmountBN,
      totalLPAmountBN,
      gauge.workingBalances,
      gauge.workingSupply,
      parseEther(userVeSdlInputAmount || "0"),
      parseEther(totalVeSDLInput || "0"),
    )

  const minVeSDL =
    !totalLPAmountBN.add(userLPAmountBN).isZero() &&
    parseEther(totalVeSDLInput || "0")
      .mul(userLPAmountBN)
      .div(totalLPAmountBN.add(userLPAmountBN))

  const maxBoostPossible =
    gauge &&
    minVeSDL &&
    calculateWorkingAmountAndBoost(
      userLPAmountBN,
      totalLPAmountBN,
      gauge.workingBalances,
      gauge.workingSupply,
      minVeSDL,
      parseEther(totalVeSDLInput || "0"),
    )

  useEffect(() => {
    if (gauge) {
      setUserLPAmountInput(formatBNToString(gauge.gaugeBalance, 18))
      setTotalLPAmountInput(formatBNToString(gauge.gaugeTotalSupply, 18))
    }
  }, [gauge])

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogContent sx={{ p: 4 }}>
        <Typography variant="h3" pb={4}>
          {t("veSdlCalculator")}
        </Typography>
        <Stack direction="column" spacing={3}>
          <TextField
            label={t("totalVeSdl")}
            value={totalVeSDLInput}
            onChange={(e) =>
              readableDecimalNumberRegex.test(e.target.value) &&
              setTotalVeSDLInput(e.target.value)
            }
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
            value={userLPAmountInput}
            onChange={(e) => {
              if (
                readableDecimalNumberRegex.test(e.target.value) ||
                e.target.value === ""
              ) {
                setUserLPAmountInput(e.target.value)
              }
            }}
          />
          <TextField
            label={t("depositAmount")}
            value={totalLPAmountInput}
            onChange={(e) => {
              if (
                readableDecimalNumberRegex.test(e.target.value) ||
                e.target.value === ""
              ) {
                setTotalLPAmountInput(e.target.value)
              }
            }}
          />
          <Typography>
            {t("maxBoost")}:{" "}
            {maxBoostPossible && formatBNToString(maxBoostPossible, 18)}
          </Typography>
          <Typography>
            <CalculateIcon
              color="primary"
              sx={{ verticalAlign: "text-bottom", mr: 0.5 }}
            />
            <Typography component="span" mr={1}>
              {t("veSdlMaxBoost")}:
            </Typography>
            {minVeSDL
              ? formatBNToString(minVeSDL, 18)
              : t("minVeSDLForMaxBoost")}
          </Typography>
          <Divider />
          <Typography variant="subtitle1">{t("myBoostCalculator")}</Typography>
          <TextField
            label="My veSDL Amount"
            value={userVeSdlInputAmount}
            onChange={(e) =>
              readableDecimalNumberRegex.test(e.target.value) &&
              setUserVeSdlInputAmount(e.target.value)
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
              {boost && formatBNToString(boost, 18)}
            </Typography>
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
