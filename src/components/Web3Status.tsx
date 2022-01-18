import "./Web3Status.scss"

import React, { ReactElement, useEffect, useState } from "react"
import AccountDetails from "./AccountDetails"
import ConnectWallet from "./ConnectWallet"
import Davatar from "@davatar/react"
import { Dialog } from "@mui/material"
import { shortenAddress } from "../utils/shortenAddress"
import { useENS } from "../hooks/useENS"
import { useTranslation } from "react-i18next"
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

  // always reset to account view
  useEffect(() => {
    if (modalOpen) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [modalOpen])

  return (
    <div className="walletStatus" data-testid="walletStatusContainer">
      <button
        type="button"
        onClick={(): void => setModalOpen(true)}
        data-testid="accountDetailButton"
      >
        {account ? (
          <div className="hasAccount">
            <span className="address">
              {ensName || shortenAddress(account)}
            </span>
            <Davatar
              size={24}
              address={account}
              generatedAvatarType="jazzicon"
            />
          </div>
        ) : (
          <div className="noAccount">{t("connectWallet")}</div>
        )}
      </button>
      <Dialog
        open={modalOpen}
        onClose={(): void => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {account && walletView === WALLET_VIEWS.ACCOUNT ? (
          <AccountDetails
            openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
            onClose={(): void => setModalOpen(false)}
          />
        ) : (
          <ConnectWallet onClose={(): void => setModalOpen(false)} />
        )}
      </Dialog>
    </div>
  )
}

export default Web3Status
