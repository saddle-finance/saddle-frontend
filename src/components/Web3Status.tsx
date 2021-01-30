import "./Web3Status.scss"

import React, { ReactElement, useState } from "react"

import ConnectWallet from "./ConnectWallet"
import Modal from "./Modal"
import profile from "../assets/icons/profile.svg"
import { useTranslation } from "react-i18next"
import { useWeb3React } from "@web3-react/core"

// Todo: Link profile image to real account image

const Web3Status = (): ReactElement => {
  const { account } = useWeb3React()
  const [modalOpen, setModalOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <div className="walletStatus">
      <button type="button" onClick={(): void => setModalOpen(true)}>
        {account ? (
          <div className="hasAccount">
            <span>
              {account.substring(0, 6)}...
              {account.substring(account.length - 4, account.length)}
            </span>

            {/* Link real profile image here */}
            <img alt="profile" src={profile} />
          </div>
        ) : (
          <div className="noAccount">{t("connectWallet")}</div>
        )}
      </button>
      <Modal isOpen={modalOpen} onClose={(): void => setModalOpen(false)}>
        <ConnectWallet onClose={(): void => setModalOpen(false)} />
      </Modal>
    </div>
  )
}

export default Web3Status
