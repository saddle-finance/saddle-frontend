import { Button, DialogContent, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import { ChainId } from "../../constants"
import Dialog from "../../components/Dialog"
import { SUPPORTED_NETWORKS } from "../../constants/networks"
import { useActiveWeb3React } from "../../hooks"
import { useTranslation } from "react-i18next"

export default function VeSDLWrongNetworkModal(): JSX.Element {
  const [openDialog, setOpenDialog] = useState(false)
  const { library, account, chainId } = useActiveWeb3React()
  const { t } = useTranslation()
  const handleConnectMainnet = () => {
    void library?.send("wallet_switchEthereumChain", [
      { chainId: "0x1" },
      account,
    ])
  }
  const chainName = chainId && SUPPORTED_NETWORKS[chainId]?.chainName

  useEffect(() => {
    if (chainId) {
      const isValidNetwork =
        chainId === ChainId.MAINNET ||
        chainId === ChainId.HARDHAT ||
        chainId == ChainId.OPTIMISM
      const networkName = SUPPORTED_NETWORKS[chainId]?.chainName
      setOpenDialog(!isValidNetwork && !!networkName)
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
