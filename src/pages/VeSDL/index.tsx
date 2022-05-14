import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import React, { useState } from "react"

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import GaugeVote from "./GaugeVote"
import LockedInfo from "./LockedInfo"
import TokenInput from "../../components/TokenInput"
import { Zero } from "@ethersproject/constants"
import { differenceInMonths } from "date-fns"
import { parseEther } from "@ethersproject/units"
import { useTranslation } from "react-i18next"

export default function VeSDL(): JSX.Element {
  const [date, setDate] = useState<Date | null>(null)
  const [sdlTokenRawVal, setSdlTokenRawVal] = useState<string>("")
  const [veSdlTokenRawVal] = useState<string>("")
  const { t } = useTranslation()
  const handleChange = (value: string) => {
    setSdlTokenRawVal(value)
  }

  const prevUnlockDate: Date = new Date("2022-5-23")
  const addLockMos = date ? differenceInMonths(date, prevUnlockDate) : null

  const lockHelperText = () => {
    const sdlTokenValue = parseEther(sdlTokenRawVal.trim() || "0")
    if (sdlTokenValue.gt(Zero) && !addLockMos) {
      return t("increaseLockAmount", { addLockAmt: sdlTokenRawVal })
    } else if (sdlTokenValue.gt(Zero) && addLockMos && addLockMos > 0) {
      return t("increaseLockAmountAndTime", {
        addLockMos,
        addLockAmt: sdlTokenRawVal,
      })
    } else if (sdlTokenValue.eq(Zero) && addLockMos && addLockMos > 0) {
      return t("increaseLockTime", { addLockMos })
    } else {
      return
    }
  }

  return (
    <Container sx={{ py: 3 }}>
      <Box display={{ sm: "flex" }} gap={2}>
        <Stack flex={1} spacing={2} mb={2}>
          <Paper
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              p: 4,
            }}
          >
            <Typography variant="h2" textAlign="center">
              {t("sdlLock")}
            </Typography>

            <TokenInput
              data-testid="sdlTokenInput"
              max="3000"
              token={{
                decimals: 18,
                symbol: "SDL",
                name: "SDL",
                priceUSD: 0,
              }}
              onChange={handleChange}
              inputValue={sdlTokenRawVal}
            />
            <Box display="flex" alignItems="center">
              <div>
                <Typography mr={1} noWrap>
                  {t("unlockDate")}:
                </Typography>
              </div>
              <DatePicker
                value={date}
                onChange={(date) => setDate(date)}
                minDate={prevUnlockDate}
                renderInput={(props) => (
                  <TextField
                    data-testid="veSdlUnlockData"
                    {...props}
                    size="small"
                    fullWidth
                  />
                )}
              />
            </Box>
            <Box textAlign="center">
              <ArrowDownwardIcon />
            </Box>
            <TokenInput
              token={{
                decimals: 18,
                symbol: "veSDL",
                name: t("voteEscrowSDL"),
                priceUSD: 0,
              }}
              readonly
              max={"3000"}
              inputValue={veSdlTokenRawVal}
            />
            <Typography
              textAlign="center"
              color="primary"
              whiteSpace="pre-line"
            >
              {lockHelperText()}
            </Typography>
            <Button variant="contained" fullWidth size="large">
              Lock
            </Button>
            <Typography textAlign="end">
              <Link>{t("veTokenCalculator")}</Link>
            </Typography>
            <Divider />
            <Typography variant="h2" textAlign="center" mb={2}>
              {t("veSdlUnlock")}
            </Typography>
            <Typography>{t("totalSdlLock")}: 3000</Typography>
            <Typography>{t("lockupExpiry")}: 09/06/2022</Typography>
            <Typography>{t("totalVeSdlHolding")}: 09/06/2022</Typography>
            <Alert severity="error" icon={false} sx={{ textAlign: "center" }}>
              {t("withdrawAlertMsg", { sdlValue: 3000 })}
            </Alert>
            <Button variant="contained" size="large" fullWidth>
              {t("unlock")}
            </Button>
          </Paper>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h2" textAlign="center" mb={2}>
              {t("veSdlHolderFeeClaim")}
            </Typography>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
            >
              <Typography>{t("yourSdlFee")}: 200</Typography>
              <Button variant="contained" size="large">
                {t("claim")}
              </Button>
            </Box>
          </Paper>
        </Stack>

        <Stack flex={1} spacing={2}>
          <LockedInfo />
          <GaugeVote />
        </Stack>
      </Box>
    </Container>
  )
}
