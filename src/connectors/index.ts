import { BaseProvider, getDefaultProvider } from "@ethersproject/providers"

import { InjectedConnector } from "@web3-react/injected-connector"
import { NetworkConnector } from "@web3-react/network-connector"
import { WalletConnectConnector } from "@web3-react/walletconnect-connector"
import { WalletLinkConnector } from "@web3-react/walletlink-connector"

const NETWORK_URL = process.env.REACT_APP_NETWORK_URL
export const NETWORK_CHAIN_ID: number = parseInt(
  process.env.REACT_APP_CHAIN_ID ?? "1",
)

if (typeof NETWORK_URL === "undefined") {
  throw new Error(
    `REACT_APP_NETWORK_URL must be a defined environment variable`,
  )
}

export const network = new NetworkConnector({
  urls: { [NETWORK_CHAIN_ID]: NETWORK_URL },
})

let networkLibrary: BaseProvider | undefined
export function getNetworkLibrary(): BaseProvider {
  const provider = getDefaultProvider(NETWORK_URL)
  return (networkLibrary = networkLibrary ?? provider)
}

export const injected = new InjectedConnector({
  // mainnet, ropsten, rinkeby, goerli, kovan, local buidler
  // see: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
  supportedChainIds: [1, 3, 4, 5, 42, 31337],
})

export const walletconnect = new WalletConnectConnector({
  rpc: { [NETWORK_CHAIN_ID]: NETWORK_URL },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  // pollingInterval: POLLING_INTERVAL / 12000
})

export const walletlink = new WalletLinkConnector({
  url: NETWORK_URL,
  appName: "Saddle",
})
