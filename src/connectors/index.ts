import { BaseProvider, getDefaultProvider } from "@ethersproject/providers"
import { SUPPORTED_NETWORKS, SupportedNetwork } from "../constants/networks"

import { InjectedConnector } from "@web3-react/injected-connector"
import { NetworkConnector } from "@web3-react/network-connector"
import { UAuthConnector } from "@uauth/web3-react"
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

function createInjectedMetaMaskProvider() {
  return new InjectedConnector({
    // mainnet, ropsten, rinkeby, goerli, optimism, kovan, kava testnet, kava, evmos testnet, evmos, fantom, local buidler
    // see: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
    supportedChainIds: Object.keys(SUPPORTED_NETWORKS).map(Number), // Must be numbers
  })
}

function createInjectedTallyProvider() {
  return new InjectedConnector({
    // currently tally supports only mainnet
    // see: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
    supportedChainIds: [1],
  })
}

export const injectedMetaMaskProvider = createInjectedMetaMaskProvider()
export const injectedTallyProvider = createInjectedTallyProvider()

export const walletconnect = new WalletConnectConnector({
  // rpc: { [NETWORK_CHAIN_ID]: NETWORK_URL },
  rpc: Object.keys(SUPPORTED_NETWORKS).reduce(
    (acc, id) => ({
      ...acc,
      [id]: (SUPPORTED_NETWORKS[id] as SupportedNetwork).rpcUrls[0],
    }),
    {},
  ),
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  supportedChainIds: [1, 10, 42161],
  // chainId: NETWORK_CHAIN_ID,
  // pollingInterval: POLLING_INTERVAL / 12000
})

export const uauth = new UAuthConnector({
  clientID: process.env.REACT_APP_UD_CLIENT_ID,
  clientSecret: process.env.REACT_APP_UD_CLIENT_SECRET,
  redirectUri: process.env.REACT_APP_UD_REDIRECT_URI,
  postLogoutRedirectUri: process.env.REACT_APP_UD_POST_LOGOUT_REDIRECT_URI,

  // Scope must include openid and wallet
  scope: "openid wallet",
  connectors: {
    injected: new InjectedConnector({ supportedChainIds: [1, 10, 42161] }),
    walletconnect,
  },
})

export const walletlink = new WalletLinkConnector({
  url: NETWORK_URL,
  appName: "Saddle",
})
