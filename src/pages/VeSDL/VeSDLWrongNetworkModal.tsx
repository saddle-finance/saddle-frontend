import { Button, DialogContent, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useChainId, useNetwork } from "wagmi"

import Dialog from "../../components/Dialog"
import { areGaugesActive } from "../../utils/gauges"
import { useTranslation } from "react-i18next"

export default function VeSDLWrongNetworkModal(): JSX.Element {
  const [openDialog, setOpenDialog] = useState(false)
  const chainId = useChainId()
  const { chain } = useNetwork()
  const chainName = chain?.name
  const { t } = useTranslation()

  const handleConnectMainnet = () => {
    // TODO implement this function
    // void provider.send("wallet_switchEthereumChain", [
    //   { chainId: "0x1" },
    //   account,
    // ])
  }

  useEffect(() => {
    if (chainId) {
      setOpenDialog(!areGaugesActive(chainId) && !!chain?.unsupported)
    }
  }, [chain?.unsupported, chainId])

  return (
    <Dialog
      open={openDialog}
      fullWidth
      onClose={() => setOpenDialog(false)}
      hideClose={true}
      disableEscapeKeyDown={false}
    >
      <DialogContent>
        <Typography textAlign="center" mt={3} whiteSpace="pre-line">
          {t("veSdlNetworkText", { chainName })}
        </Typography>
        <Button
          variant="contained"
          fullWidth
          onClick={handleConnectMainnet}
          sx={{ mt: 3 }}
        >
          {t("changeToMainnet")}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
