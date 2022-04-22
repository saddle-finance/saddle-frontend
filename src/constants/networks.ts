import { ChainId } from "./index"
import { hexlify } from "@ethersproject/bytes"

export const NETWORK_LABEL: Partial<Record<ChainId, string>> = {
  [ChainId.MAINNET]: "Ethereum",
  [ChainId.ARBITRUM]: "Arbitrum",
  [ChainId.OPTIMISM]: "Optimism",
  [ChainId.FANTOM]: "Fantom",
  [ChainId.ROPSTEN]: "Ropsten",
  [ChainId.EVMOS]: "Evmos",
  [ChainId.EVMOS_TESTNET]: "Evmos Testnet",
  [ChainId.HARDHAT]: "Hardhat 👷🏼‍♂️",
}

// refer to https://github.com/sushiswap/sushiswap-interface/blob/canary/src/modals/NetworkModal/index.tsx#L13
export const SUPPORTED_NETWORKS: {
  [chainId in ChainId]?: {
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
} = {
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
}

export const DEV_SUPPORTED_NETWORKS: {
  [chainId in ChainId]?: {
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
} = {
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
}
