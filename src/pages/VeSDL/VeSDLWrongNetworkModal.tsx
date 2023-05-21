import { Button, DialogContent, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import Dialog from "../../components/Dialog"
import { SUPPORTED_NETWORKS } from "../../constants/networks"
import { areGaugesActive } from "../../utils/gauges"
import { useChainId } from "wagmi"
import { useTranslation } from "react-i18next"

export default function VeSDLWrongNetworkModal(): JSX.Element {
  const [openDialog, setOpenDialog] = useState(false)
  const chainId = useChainId()
  const { t } = useTranslation()

  const handleConnectMainnet = () => {
    // void provider.send("wallet_switchEthereumChain", [
    //   { chainId: "0x1" },
    //   account,
    // ])
  }
  const chainName = chainId && SUPPORTED_NETWORKS[chainId]?.chainName

  useEffect(() => {
    if (chainId) {
      const networkName = SUPPORTED_NETWORKS[chainId]?.chainName
      setOpenDialog(!areGaugesActive(chainId) && !!networkName)
    }
  }, [chainId])

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
