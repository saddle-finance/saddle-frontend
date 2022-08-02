import { Button, Typography } from "@mui/material"
import React, { ReactElement, useEffect, useState } from "react"

import AccountDetails from "./AccountDetails"
import ConnectWallet from "./ConnectWallet"
import Dialog from "./Dialog"
import Identicon from "./Identicon"
import { shortenAddress } from "../utils/shortenAddress"
import { useENS } from "../hooks/useENS"
import { useTranslation } from "react-i18next"
import { useUDName } from "../hooks/useUDName"
import { useWeb3React } from "@web3-react/core"

const WALLET_VIEWS = {
  OPTIONS: "options",
  ACCOUNT: "account",
}

const Web3Status = (): ReactElement => {
  const { account } = useWeb3React()
  const [modalOpen, setModalOpen] = useState(false)
  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)
  const { t } = useTranslation()
  const { ensName } = useENS(account)
  const udName = useUDName()

  // always reset to account view
  useEffect(() => {
    if (modalOpen) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [modalOpen])

  return (
    <div data-testid="walletStatusContainer">
      <Button
        variant={account ? "contained" : "outlined"}
        color={account ? "mute" : "secondary"}
        onClick={(): void => setModalOpen(true)}
        data-testid="accountDetailButton"
        endIcon={account && <Identicon />}
      >
        <Typography variant="body1" whiteSpace="nowrap">
          {account
            ? udName || ensName || shortenAddress(account)
            : t("connectWallet")}
        </Typography>
      </Button>
      <Dialog
        open={modalOpen}
        onClose={(): void => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {account && walletView === WALLET_VIEWS.ACCOUNT ? (
          <AccountDetails
            openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
          />
        ) : (
          <ConnectWallet onClose={(): void => setModalOpen(false)} />
        )}
      </Dialog>
    </div>
  )
}

export default Web3Status
