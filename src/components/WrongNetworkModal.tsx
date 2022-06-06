import { DialogContent, Typography } from "@mui/material"
import React, { ReactElement, useState } from "react"
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core"
import Dialog from "./Dialog"
import { Web3Provider } from "@ethersproject/providers"
import { useTranslation } from "react-i18next"

export default function WrongNetworkModal(): ReactElement {
  const [open, setOpen] = useState<boolean | undefined>()
  const { error } = useWeb3React<Web3Provider>()
  const isUnsupportChainIdError = error instanceof UnsupportedChainIdError
  const { t } = useTranslation()

  return (
    <Dialog
      open={open ?? isUnsupportChainIdError}
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
