import { Button, DialogContent, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { mainnet, useAccount, useChainId, useNetwork } from "wagmi"

import Dialog from "../../components/Dialog"
import { areGaugesActive } from "../../utils/gauges"
import { useTranslation } from "react-i18next"

export default function VeSDLWrongNetworkModal(): JSX.Element {
  const [openDialog, setOpenDialog] = useState(false)
  const chainId = useChainId()
  const { connector: activeConnector } = useAccount()
  const { chain } = useNetwork()
  const chainName = chain?.name
  const { t } = useTranslation()

  const handleConnectMainnet = async () => {
    if (!activeConnector) return
    await activeConnector.switchChain?.(mainnet.id)
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
          onClick={() => void handleConnectMainnet()}
          sx={{ mt: 3 }}
        >
          {t("changeToMainnet")}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
