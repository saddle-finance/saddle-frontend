import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material"
import DialogTitle from "../../components/DialogTitle"
import React from "react"
import { useTranslation } from "react-i18next"

type Props = { open: boolean; onClose?: () => void }

export default function ReviewCreatePool({
  open,
  onClose,
}: Props): JSX.Element {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle variant="h1" onClose={onClose}>
        Review Pool Creation
      </DialogTitle>
      <DialogContent>
        <Alert icon={false} color="warning">
          Double check the inputs for your pool are as you want it-- once a pool
          is created, it can be modified but cannot be deleted (it&lsquo;ll live
          on the blockchain forever!)
        </Alert>
        <Stack my={3} spacing={1}>
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("poolName")}</Typography>
            <Typography>vUSD</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("poolSymbol")}</Typography>
            <Typography>Saddle-vUSD</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("fee")}</Typography>
            <Typography>0.9%</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("aParameter")}</Typography>
            <Typography>120</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("poolType")}</Typography>
            <Typography>USD MetaPool</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>Tokens</Typography>
            <Typography>vUSD</Typography>
          </Box>
        </Stack>
        <Divider />
        <Typography my={3}>
          Output is estimated. If the input is invalid or the gas is too low,
          your transaction will revert.
        </Typography>
        <Stack spacing={1}>
          <Button variant="contained" size="large">
            Create Pool
          </Button>
          <Button size="large">Go back to edit</Button>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
