import { ChainId } from "./index"

export const NETWORK_LABEL: Partial<Record<ChainId, string>> = {
  [ChainId.MAINNET]: "Ethereum",
  [ChainId.ARBITRUM]: "MaticMumbai",
  //[ChainId.MATICMUMBAI]: "MaticMumbai",
  [ChainId.ROPSTEN]: "Ropsten",
  [ChainId.HARDHAT]: "Hardhat 👷🏼‍♂️",
}
