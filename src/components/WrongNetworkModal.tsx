import { DialogContent, Typography } from "@mui/material"
import React, { ReactElement, useState } from "react"
import Dialog from "./Dialog"
import { useNetwork } from "wagmi"
import { useTranslation } from "react-i18next"

export default function WrongNetworkModal(): ReactElement {
  const [open, setOpen] = useState<boolean | undefined>()
  const { chain } = useNetwork()
  const unsupportedChain = chain?.unsupported
  const { t } = useTranslation()

  return (
    <Dialog
      open={open ?? !!unsupportedChain}
      maxWidth="xs"
      onClose={() => setOpen(false)}
    >
      <DialogContent sx={{ whiteSpace: "pre-line" }}>
        <Typography textAlign="center" mb={3} sx={{ fontSize: 48 }}>
          &#129325;
        </Typography>
        <Typography>{t("wrongNetworkContent")}</Typography>
      </DialogContent>
    </Dialog>
  )
}
