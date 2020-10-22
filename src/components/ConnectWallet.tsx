import "./ConnectWallet.scss"

import React, { ReactElement } from "react"
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core"
import {
  injected,
  portis,
  squarelink,
  walletconnect,
  walletlink,
} from "../connectors"

import coinbasewalletIcon from "../assets/icons/coinbasewallet.svg"
import metamaskIcon from "../assets/icons/metamask.svg"
import portisIcon from "../assets/icons/portis.svg"
import squarelinkIcon from "../assets/icons/squarelink.svg"
import { useTranslation } from "react-i18next"
import walletconnectIcon from "../assets/icons/walletconnect.svg"

// Dumb data starts
const wallets = [
  {
    name: "MetaMask",
    icon: metamaskIcon,
    connector: injected,
  },
  {
    name: "Wallet Connect",
    icon: walletconnectIcon,
    connector: walletconnect,
  },
  {
    name: "Coinbase Wallet",
    icon: coinbasewalletIcon,
    connector: walletlink,
  },
  {
    name: "Portis",
    icon: portisIcon,
    connector: portis,
  },
  {
    name: "Squarelink",
    icon: squarelinkIcon,
    connector: squarelink,
  },
]

interface Props {
  onClose: () => void
}
// Dumb data ends
function ConnectWallet({ onClose }: Props): ReactElement {
  const { t } = useTranslation()
  const { activate } = useWeb3React()

  return (
    <div className="connectWallet">
      <h3>{t("connectWallet")}</h3>
      <div className="walletList">
        {wallets.map((wallet, index) => (
          <button
            key={index}
            onClick={(): void => {
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
        {t("dontHaveWallet")}
        <a href="https://ethereum.org/en/wallets/" target="blank">
          {t("getWallet")}
        </a>
      </p>
    </div>
  )
}

export default ConnectWallet
