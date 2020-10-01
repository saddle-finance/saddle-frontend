import { InjectedConnector } from "@web3-react/injected-connector"
import { NetworkConnector } from "@web3-react/network-connector"
import { Web3Provider } from "@ethersproject/providers"

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

const { getProvider } = network

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? new Web3Provider(getProvider))
}

export const injected = new InjectedConnector({
  // mainnet, ropsten, rinkeby, goerli, kovan
  // see: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
  supportedChainIds: [1, 3, 4, 5, 42],
})
