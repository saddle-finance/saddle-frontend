import {
  Chain,
  Wallet,
  connectorsForWallets,
  wallet,
} from "@rainbow-me/rainbowkit"
import {
  chain,
  configureChains,
  createClient as createWagmiClient,
} from "wagmi"

import { ChainId } from "./index"
import { InjectedConnector } from "wagmi/connectors/injected"
import { alchemyProvider } from "wagmi/providers/alchemy"
import { hexlify } from "@ethersproject/bytes"
import { publicProvider } from "wagmi/providers/public"
import tallyIcon from "../assets/icons/tally.svg"

export const NETWORK_LABEL: Partial<Record<ChainId, string>> = {
  [ChainId.MAINNET]: "Ethereum",
  [ChainId.ARBITRUM]: "Arbitrum",
  [ChainId.OPTIMISM]: "Optimism",
  [ChainId.FANTOM]: "Fantom",
  [ChainId.ROPSTEN]: "Ropsten",
  [ChainId.EVMOS]: "Evmos",
  [ChainId.EVMOS_TESTNET]: "Evmos Testnet",
  [ChainId.KAVA_TESTNET]: "Kava Testnet",
  [ChainId.KAVA]: "Kava",
  [ChainId.HARDHAT]: "Hardhat 👷🏼‍♂️",
}

// TODO: figure out better way of representing non-erc20 native tokens
export const NETWORK_NATIVE_TOKENS: Record<ChainId, string> = {
  [ChainId.MAINNET]: "ETH",
  [ChainId.ARBITRUM]: "ETH",
  [ChainId.OPTIMISM]: "ETH",
  [ChainId.FANTOM]: "FTM",
  [ChainId.ROPSTEN]: "ETH",
  [ChainId.EVMOS]: "EVMOS",
  [ChainId.EVMOS_TESTNET]: "tEVMOS",
  [ChainId.KAVA_TESTNET]: "KAVA",
  [ChainId.KAVA]: "KAVA",
  [ChainId.HARDHAT]: "ETH",
}
export const COINGECKO_PLATFORM_ID: Record<ChainId, string | null> = {
  [ChainId.MAINNET]: "ethereum",
  [ChainId.ARBITRUM]: "arbitrum-one",
  [ChainId.OPTIMISM]: "optimistic-ethereum",
  [ChainId.FANTOM]: "fantom",
  [ChainId.ROPSTEN]: null,
  [ChainId.EVMOS]: "evmos",
  [ChainId.EVMOS_TESTNET]: null,
  [ChainId.KAVA_TESTNET]: null,
  [ChainId.KAVA]: "kava",
  [ChainId.HARDHAT]: null,
}

export type SupportedNetwork = {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

export type SupportedNetworks = Partial<{ [key in ChainId]: SupportedNetwork }>

// refer to https://github.com/sushiswap/sushiswap-interface/blob/canary/src/modals/NetworkModal/index.tsx#L13
export const SUPPORTED_NETWORKS: SupportedNetworks = {
  [ChainId.MAINNET]: {
    chainId: "0x1",
    chainName: "Ethereum",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.infura.io/v3"],
    blockExplorerUrls: ["https://etherscan.com"],
  },
  [ChainId.ARBITRUM]: {
    chainId: "0xA4B1",
    chainName: "Arbitrum",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://mainnet-arb-explorer.netlify.app"],
  },
  [ChainId.OPTIMISM]: {
    chainId: "0xA",
    chainName: "Optimism",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.optimism.io"],
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
  },
  [ChainId.FANTOM]: {
    chainId: "0xFA",
    chainName: "Fantom",
    nativeCurrency: {
      name: "Fantom",
      symbol: "FTM",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.ftm.tools"],
    blockExplorerUrls: ["https://ftmscan.com"],
  },
  [ChainId.EVMOS]: {
    chainId: hexlify(9001),
    chainName: "Evmos",
    nativeCurrency: {
      name: "Evmos",
      symbol: "EVMOS",
      decimals: 18,
    },
    rpcUrls: ["https://eth.bd.evmos.org:8545"],
    blockExplorerUrls: ["https://evm.evmos.org"],
  },
  [ChainId.KAVA]: {
    chainId: "0x8AE", // hexlify doesn't work as expected for this number.
    chainName: "Kava",
    nativeCurrency: {
      name: "Kava",
      symbol: "KAVA",
      decimals: 18,
    },
    rpcUrls: ["https://evm.kava.io"],
    blockExplorerUrls: ["https://explorer.kava.io"],
  },
}

export const DEV_SUPPORTED_NETWORKS: SupportedNetworks = {
  ...SUPPORTED_NETWORKS,
  [ChainId.EVMOS_TESTNET]: {
    chainId: hexlify(9000),
    chainName: "Evmos Testnet",
    nativeCurrency: {
      name: "Evmos",
      symbol: "tEVMOS",
      decimals: 18,
    },
    rpcUrls: ["https://eth.bd.evmos.dev:8545"],
    blockExplorerUrls: ["https://evm.evmos.dev"],
  },
  [ChainId.KAVA_TESTNET]: {
    chainId: "0x8AD",
    chainName: "Kava Testnet",
    nativeCurrency: {
      name: "Kava",
      symbol: "KAVA",
      decimals: 18,
    },
    rpcUrls: ["https://evm.testnet.kava.io"],
    blockExplorerUrls: ["https://explorer.evm-alpha.kava.io"],
  },
}

const evmosChain: Chain = {
  id: ChainId.EVMOS,
  iconUrl:
    "https://assets.coingecko.com/coins/images/24023/small/evmos.png?1653958927",
  iconBackground: "#fff",
  name: "Evmos",
  nativeCurrency: {
    name: "Evmos",
    symbol: "EVMOS",
    decimals: 18,
  },
  network: "evmos",
  rpcUrls: { default: "https://eth.bd.evmos.org:8545" },
  blockExplorers: {
    default: { name: "Evmos", url: "https://evm.evmos.org" },
  },
  testnet: false,
}
const fantomChain: Chain = {
  id: ChainId.FANTOM,
  iconUrl:
    "https://assets.coingecko.com/coins/images/4001/small/Fantom.png?1558015016",
  iconBackground: "#fff",
  name: "Fantom",
  nativeCurrency: {
    name: "Fantom",
    symbol: "FTM",
    decimals: 18,
  },
  network: "evmos",
  rpcUrls: { default: "https://rpc.ftm.tools" },
  blockExplorers: {
    default: { name: "Fantom Scan", url: "https://ftmscan.com" },
  },
  testnet: false,
}
const kavaChain: Chain = {
  id: ChainId.KAVA,
  iconUrl:
    "https://assets.coingecko.com/coins/images/9761/small/kava.jpg?1639703080",
  iconBackground: "#fff",
  name: "Kava",
  nativeCurrency: {
    name: "Kava",
    symbol: "KAVA",
    decimals: 18,
  },
  network: "kava",
  rpcUrls: { default: "https://evm.kava.io" },
  blockExplorers: {
    default: { name: "Kava", url: "https://explorer.kava.io" },
  },
  testnet: false,
}

export const rainbowChains = [
  chain.mainnet,
  chain.optimism,
  chain.arbitrum,
  chain.hardhat,
  evmosChain,
  fantomChain,
  kavaChain,
]

export const { chains, provider } = configureChains(rainbowChains, [
  alchemyProvider({ apiKey: "qNhZ_-GaDehhI-HSlG_dff9nxS6nuXGg" }),
  publicProvider(),
])

const tallyConnector = new InjectedConnector({
  chains: [chain.mainnet],
  options: {
    shimDisconnect: true,
    name: (detectedName) =>
      `Injected (${
        typeof detectedName === "string"
          ? detectedName
          : detectedName.join(", ")
      })`,
  },
})

const tally = (): Wallet => ({
  id: "tally-wallet",
  name: "Tally Wallet",
  iconUrl: tallyIcon,
  iconBackground: "#0c2f78",
  downloadUrls: {
    browserExtension: "https://tally.cash/download",
  },
  createConnector: () => {
    const connector = tallyConnector
    return {
      connector: connector,
    }
  },
})

const needsInjectedWalletFallback =
  typeof window !== "undefined" &&
  !window.ethereum?.isMetaMask &&
  !window.ethereum?.isTally

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      wallet.metaMask({ chains }),
      wallet.rainbow({ chains }),
      wallet.walletConnect({ chains }),
      wallet.brave({ chains }),
      wallet.coinbase({ appName: "Saddle", chains }),
      wallet.ledger({ chains }),
      tally(),
      ...(needsInjectedWalletFallback
        ? [wallet.injected({ chains: [chain.mainnet] })]
        : []),
    ],
  },
])

export const wagmiClient = createWagmiClient({
  autoConnect: true,
  connectors,
  provider,
})

export interface MyWalletOptions {
  chains: Chain[]
}
