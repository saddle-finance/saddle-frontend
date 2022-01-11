import { ChainId } from "./index"

export const NETWORK_LABEL: Partial<Record<ChainId, string>> = {
  [ChainId.MATICMUMBAI]: "MaticMumbai",
  [ChainId.HARDHAT]: "Hardhat 👷🏼‍♂️",
}
