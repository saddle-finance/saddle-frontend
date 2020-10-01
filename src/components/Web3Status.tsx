import React, { useState } from "react"
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core"
import "./Web3Status.scss"

import Modal from "./Modal"
import ConnectWallet from "./ConnectWallet"
import { injected } from "../connectors"

// Todo: Link profile image to real account image

const Web3Status = () => {
  const { account, activate } = useWeb3React()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="walletStatus">
      <button
        type="button"
        onClick={() => {
          setModalOpen(true)
          // Disabled injected for pop up UI test
          activate(injected, undefined, true).catch((error) => {
            if (error instanceof UnsupportedChainIdError) {
              activate(injected) // a little janky...can't use setError because the connector isn't set
            } else {
              // TODO: handle error
            }
          })
        }}
      >
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
        <ConnectWallet />
      </Modal>
    </div>
  )
}

export default Web3Status
