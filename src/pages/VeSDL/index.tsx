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
import { DatePicker } from "@mui/lab"
import GaugeVote from "./GaugeVote"
import LockedInfo from "./LockedInfo"
import TokenInput from "../../components/TokenInput"
import { useTranslation } from "react-i18next"

export default function VeSDL(): JSX.Element {
  const [date, setDate] = useState<string | null>(null)
  const [sdlTokenVal, setSdlTokenVal] = useState<string>("0.0")
  const { t } = useTranslation()
  const handleChange = (value: string) => {
    setSdlTokenVal(value)
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
              allowDecimalOverflow
              symbol="SDL"
              name="sdl"
              max="3000"
              onChange={handleChange}
              inputValue={sdlTokenVal}
            />
            <Box display="flex" alignItems="center">
              <div>
                <Typography mr={1} noWrap>
                  Unlock date:
                </Typography>
              </div>
              <DatePicker
                value={date}
                onChange={(date) => setDate(date)}
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
              symbol="veSDL"
              allowDecimalOverflow
              name="Vote escrow SDL"
              max={"0"}
              onChange={handleChange}
              inputValue="0.0"
            />
            <Button variant="contained" fullWidth size="large">
              Lock
            </Button>
            <Typography textAlign="end">
              <Link>veToken calculator</Link>
            </Typography>
            <Divider />
            <Typography variant="h2" textAlign="center" mb={2}>
              {t("veSdlUnlock")}
            </Typography>
            <Typography>{t("totalSdlLock")}: 3000</Typography>
            <Typography>{t("lockupExpiray")}: 09/06/2022</Typography>
            <Alert severity="error" icon={false} sx={{ textAlign: "center" }}>
              {t("withdrawAlertMsg", { sdlValue: 3000 })}
            </Alert>
            <Button variant="contained" size="large" fullWidth>
              Unlock
            </Button>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h2" textAlign="center">
              {t("veSdlHolderFeeClaim")}
            </Typography>
            <Box
              display="flex"
              justifyContent="center"
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
