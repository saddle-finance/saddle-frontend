import React from "react"
import "./ConnectWallet.scss"

// Dumb data starts
const wallets = [
  {
    name: "MetaMask",
    icon: require("../assets/icons/metamask.svg"),
  },
  {
    name: "Wallet Connect",
    icon: require("../assets/icons/walletconnect.svg"),
  },
  {
    name: "Coinbase Wallet",
    icon: require("../assets/icons/coinbasewallet.svg"),
  },
  {
    name: "Portis",
    icon: require("../assets/icons/portis.svg"),
  },
]

// Dumb data ends
function ConnectWallet() {
  return (
    <div className="connectWallet">
      <h3>Connect to a wallet</h3>
      <div className="walletList">
        {wallets.map((wallet, index) => (
          <button key={index}>
            <span>{wallet.name}</span>
            <img src={wallet.icon} alt="Icon" />
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
