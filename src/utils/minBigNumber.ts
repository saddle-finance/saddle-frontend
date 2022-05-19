import { BigNumber } from "@ethersproject/bignumber"

export function minBigNumber(a: BigNumber, b: BigNumber): BigNumber {
  return a.lt(b) ? a : b
}
