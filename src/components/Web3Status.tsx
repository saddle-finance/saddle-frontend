import "./Web3Status.scss"

import React, { ReactElement, useEffect, useState } from "react"

import AccountDetails from "./AccountDetails"
import ConnectWallet from "./ConnectWallet"
import Davatar from "@davatar/react"
import Modal from "./Modal"
import { SUPPORTED_WALLETS } from "../constants"
import { find } from "lodash"
import { shortenAddress } from "../utils/shortenAddress"
import { uauth } from "../connectors"
import { useENS } from "../hooks/useENS"
import { useTranslation } from "react-i18next"
import { useWeb3React } from "@web3-react/core"

const WALLET_VIEWS = {
  OPTIONS: "options",
  ACCOUNT: "account",
}

const Web3Status = (): ReactElement => {
  const { account, connector } = useWeb3React()
  const [modalOpen, setModalOpen] = useState(false)
  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)
  const { t } = useTranslation()
  const { ensName } = useENS(account)
  const [user, setUser] = useState<string>("")

  const connectorName = find(SUPPORTED_WALLETS, ["connector", connector])?.name
  useEffect(() => {
    const checkUDName = async () => {
      if (connectorName === "Unstoppable Domains") {
        const userUD = await uauth.uauth.user()
        setUser(userUD.sub)
      }
    }
    void checkUDName()
    return () => {
      setUser("")
    }
  }, [connectorName])

  // always reset to account view
  useEffect(() => {
    if (modalOpen) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [modalOpen])

  return (
    <div className="walletStatus">
      <button type="button" onClick={(): void => setModalOpen(true)}>
        {account ? (
          <div className="hasAccount">
            <span className="address">
              {user || ensName || shortenAddress(account)}
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
      <Modal isOpen={modalOpen} onClose={(): void => setModalOpen(false)}>
        {account && walletView === WALLET_VIEWS.ACCOUNT ? (
          <AccountDetails
            openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
          />
        ) : (
          <ConnectWallet onClose={(): void => setModalOpen(false)} />
        )}
      </Modal>
    </div>
  )
}

export default Web3Status
