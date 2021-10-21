import { ChainId } from "./index"

export const NETWORK_LABEL: Partial<Record<ChainId, string>> = {
  [ChainId.MAINNET]: "Ethereum",
  [ChainId.ARBITRUM]: "Arbitrum",
  [ChainId.ROPSTEN]: "Ropsten",
  [ChainId.HARDHAT]: "Hardhat 👷🏼‍♂️",
}
