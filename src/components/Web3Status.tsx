import React, { useState } from "react"
import { useWeb3React } from "@web3-react/core"
import "./Web3Status.scss"

import Modal from "./Modal"
import ConnectWallet from "./ConnectWallet"

// Todo: Link profile image to real account image

const Web3Status = () => {
  const { account } = useWeb3React()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="walletStatus">
      <button type="button" onClick={() => setModalOpen(true)}>
        {account ? (
          <div className="hasAccount">
            <span>
              {account.substring(0, 6)}...
              {account.substring(account.length - 4, account.length)}
            </span>

            {/* Link real profile image here */}
            <img alt="profile" src={require("../assets/icons/profile.svg")} />
          </div>
        ) : (
          <div className="noAccount">Connect Wallet</div>
        )}
      </button>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <ConnectWallet onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}

export default Web3Status
