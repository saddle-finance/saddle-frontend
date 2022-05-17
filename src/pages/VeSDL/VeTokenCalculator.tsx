import {
  DialogContent,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import React, { useState } from "react"
import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import CalculateIcon from "@mui/icons-material/Calculate"
import Dialog from "../../components/Dialog"
import { readableDecimalNumberRegex } from "../../constants"
import { useTranslation } from "react-i18next"

type Props = { open: boolean; onClose: () => void }

export default function VeTokenCalculator({
  open,
  onClose,
}: Props): JSX.Element {
  const { t } = useTranslation()
  const [totalVeSdl, setTotalVeSdl] = useState<string>("")
  const [poolLiquidity, setPoolLiquidity] = useState<string>("")
  const [depositAmount, setDepositAmount] = useState<string>("")
  const [poolName, setPoolName] = useState<string>("D4")
  const [userVeSdlAmt, setUserVeSdlAmt] = useState<string>("")

  //Test purpose
  console.log(setPoolLiquidity)
  console.log(setDepositAmount)

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogContent sx={{ p: 4 }}>
        <Typography variant="h3" pb={4}>
          {t("veSdlCalculator")}
        </Typography>
        <Stack direction="column" spacing={3}>
          <TextField
            label={t("totalVeSdl")}
            value={totalVeSdl}
            onChange={(e) =>
              readableDecimalNumberRegex.test(e.target.value) &&
              setTotalVeSdl(e.target.value)
            }
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
            <MenuItem value="D4">D4 - Ethereum</MenuItem>
            <MenuItem value="BTC">BTC - Ethereum</MenuItem>
            <MenuItem value="tBTC">tBTC - Ethereum</MenuItem>
            <MenuItem value="arbFrax">arbFrax - Arbitrum</MenuItem>
          </TextField>

          <TextField label={t("poolLiquidity")} value={poolLiquidity} />
          <TextField label={t("depositAmount")} value={depositAmount} />
          <Typography>{t("maxBoost")}: ...</Typography>
          <Typography>
            <CalculateIcon
              color="primary"
              sx={{ verticalAlign: "text-bottom", mr: 1 }}
            />
            {t("veSdlMaxBoost")}:
          </Typography>
          <Divider />
          <Typography variant="subtitle1">{t("myBoostCalculator")}</Typography>
          <TextField
            label="My veSDL Amount"
            value={userVeSdlAmt}
            onChange={(e) =>
              readableDecimalNumberRegex.test(e.target.value) &&
              setUserVeSdlAmt(e.target.value)
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
              0x (0 veSDL)
            </Typography>
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
