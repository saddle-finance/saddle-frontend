import { ChainId } from "./index"

export const NETWORK_LABEL: Partial<Record<ChainId, string>> = {
  [ChainId.MAINNET]: "Ethereum",
  [ChainId.ARBITRUM]: "Arbitrum",
  [ChainId.OPTIMISM]: "Optimism",
  [ChainId.FANTOM]: "Fantom",
  [ChainId.ROPSTEN]: "Ropsten",
  [ChainId.HARDHAT]: "Hardhat 👷🏼‍♂️",
}

// TODO: figure out better way of representing non-erc20 native tokens
export const NETWORK_NATIVE_TOKENS: Record<ChainId, string> = {
  [ChainId.MAINNET]: "ETH",
  [ChainId.ARBITRUM]: "ETH",
  [ChainId.OPTIMISM]: "ETH",
  [ChainId.FANTOM]: "FTM",
  [ChainId.ROPSTEN]: "ETH",
  [ChainId.HARDHAT]: "ETH",
}
