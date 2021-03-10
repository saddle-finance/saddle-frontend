import { BigNumber } from "@ethersproject/bignumber"
import { SWAP_CONTRACT_GAS_ESTIMATES_MAP } from "../constants/index"

export function calculateGasEstimate(methodName: string): BigNumber {
  return SWAP_CONTRACT_GAS_ESTIMATES_MAP[methodName]
  //   return contract.estimateGas.{methodName}.sub(BigNumber.from(10).pow(18))
}

export function formatGasEstimateToString(gasEstimate: BigNumber): string {
  return "$" + gasEstimate.toString()
}
