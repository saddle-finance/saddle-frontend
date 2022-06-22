import {
  DialogContent,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import React, { useContext, useEffect, useState } from "react"
import { calculateBoost, formatBNToString, isNumberOrEmpty } from "../../utils"

import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { BasicPoolsContext } from "../../providers/BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import CalculateIcon from "@mui/icons-material/Calculate"
import Dialog from "../../components/Dialog"
import { GaugeContext } from "../../providers/GaugeProvider"
import { parseEther } from "@ethersproject/units"
import { useTranslation } from "react-i18next"

type Props = {
  open: boolean
  onClose: () => void
  userBalanceVeSDL: BigNumber
  totalSupplyVeSDL: BigNumber
}

export default function VeTokenCalculator({
  open,
  onClose,
  totalSupplyVeSDL,
  userBalanceVeSDL,
}: Props): JSX.Element {
  const { t } = useTranslation()
  const basicPools = useContext(BasicPoolsContext)
  const gaugeData = useContext(GaugeContext)
  const [userLPAmountInput, setUserLPAmountInput] = useState<string>("")
  const [totalLPAmountInput, setTotalLPAmountInput] = useState<string>("")
  const [poolNameValue, setPoolNameValue] = useState<string>("D4")
  const [userVeSDLInputAmount, setUserVeSdlInputAmount] = useState<string>(
    userBalanceVeSDL.isZero() ? "" : formatBNToString(userBalanceVeSDL, 18),
  )
  const [totalVeSDLInput, setTotalVeSDLInput] = useState<string>(
    totalSupplyVeSDL.isZero() ? "" : formatBNToString(totalSupplyVeSDL, 18),
  )

  const pool = basicPools && basicPools[poolNameValue]
  const gauge =
    !!pool?.lpToken && gaugeData.gauges
      ? gaugeData.gauges[pool.lpToken]
      : undefined

  const userLPAmountBN = parseEther(userLPAmountInput || "0")
  const totalLPAmountBN = parseEther(totalLPAmountInput || "0")

  useEffect(() => {
    if (gauge) {
      setUserLPAmountInput(
        gauge.gaugeBalance ? formatBNToString(gauge.gaugeBalance, 18) : "",
      )
      setTotalLPAmountInput(
        gauge.gaugeTotalSupply
          ? formatBNToString(gauge.gaugeTotalSupply, 18)
          : "",
      )
    }
  }, [gauge])

  if (!gauge || !gauge.workingBalances || !gauge.workingSupply)
    return <div></div>

  const minVeSDL =
    !totalLPAmountBN.add(userLPAmountBN).isZero() &&
    parseEther(totalVeSDLInput || "0")
      .mul(userLPAmountBN)
      .div(totalLPAmountBN.add(userLPAmountBN))

  const boost = calculateBoost(
    userLPAmountBN,
    totalLPAmountBN,
    gauge.workingBalances,
    gauge.workingSupply,
    parseEther(userVeSDLInputAmount || "0"),
    parseEther(totalVeSDLInput || "0"),
  )

  const maxBoostPossible =
    minVeSDL &&
    calculateBoost(
      userLPAmountBN,
      totalLPAmountBN,
      gauge.workingBalances,
      gauge.workingSupply,
      minVeSDL,
      parseEther(totalVeSDLInput || "0"),
    )

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
              isNumberOrEmpty(e.target.value) &&
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
              Object.keys(basicPools)?.map((poolName) => {
                const pool = basicPools[poolName]
                const outdated =
                  pool?.isGuarded || pool?.isMigrated || pool?.isPaused
                if (outdated) return null
                return (
                  <MenuItem key={poolName} value={poolName}>
                    {poolName}
                  </MenuItem>
                )
              })}
          </TextField>

          <TextField
            label={t("poolLiquidity")}
            value={userLPAmountInput}
            onChange={(e) => {
              if (isNumberOrEmpty(e.target.value))
                setUserLPAmountInput(e.target.value)
            }}
          />
          <TextField
            label={t("depositAmount")}
            value={totalLPAmountInput}
            onChange={(e) => {
              if (isNumberOrEmpty(e.target.value))
                setTotalLPAmountInput(e.target.value)
            }}
          />
          <Typography>
            <Typography component="span" mr={1}>
              {t("maxBoost")}:
            </Typography>
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
            value={userVeSDLInputAmount}
            onChange={(e) =>
              isNumberOrEmpty(e.target.value) &&
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
