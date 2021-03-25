import { BigNumber } from "@ethersproject/bignumber"
import { SWAP_CONTRACT_GAS_ESTIMATES_MAP } from "../constants/index"

export function calculateGasEstimate(
  methodName: keyof typeof SWAP_CONTRACT_GAS_ESTIMATES_MAP,
): BigNumber {
  return SWAP_CONTRACT_GAS_ESTIMATES_MAP[methodName]
}
