import React from "react"
import "./ConnectWallet.scss"

import {
  injected,
  walletconnect,
  walletlink,
  portis,
  squarelink,
} from "../connectors"
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core"

// Dumb data starts
const wallets = [
  {
    name: "MetaMask",
    icon: require("../assets/icons/metamask.svg"),
    connector: injected,
  },
  {
    name: "Wallet Connect",
    icon: require("../assets/icons/walletconnect.svg"),
    connector: walletconnect,
  },
  {
    name: "Coinbase Wallet",
    icon: require("../assets/icons/coinbasewallet.svg"),
    connector: walletlink,
  },
  {
    name: "Portis",
    icon: require("../assets/icons/portis.svg"),
    connector: portis,
  },
  {
    name: "Squarelink",
    icon: require("../assets/icons/squarelink.svg"),
    connector: squarelink,
  },
]

interface Props {
  onClose: () => void
}
// Dumb data ends
function ConnectWallet({ onClose }: Props) {
  const { activate } = useWeb3React()

  return (
    <div className="connectWallet">
      <h3>Connect to a wallet</h3>
      <div className="walletList">
        {wallets.map((wallet, index) => (
          <button
            key={index}
            onClick={() => {
              activate(wallet.connector, undefined, true).catch((error) => {
                if (error instanceof UnsupportedChainIdError) {
                  activate(wallet.connector) // a little janky...can't use setError because the connector isn't set
                } else {
                  // TODO: handle error
                }
              })
              onClose()
            }}
          >
            <span>{wallet.name}</span>
            <img src={wallet.icon} alt="Icon" className="icon" />
          </button>
        ))}
      </div>
      <p>
        Don&apos;t have a wallet? &nbsp;
        <a href="https://ethereum.org/en/wallets/" target="blank">
          Get a wallet!
        </a>
      </p>
    </div>
  )
}

export default ConnectWallet
