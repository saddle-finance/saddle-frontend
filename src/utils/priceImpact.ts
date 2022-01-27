import { BigNumber } from "@ethersproject/bignumber"
import { Zero } from "@ethersproject/constants"

export function isHighPriceImpact(priceImpact: BigNumber): boolean {
  // assumes that priceImpact has 18d precision
  const negOne = BigNumber.from(10)
    .pow(18 - 2)
    .mul(-1)
  return priceImpact.lte(negOne)
}

export function calculatePriceImpact(
  tokenInputAmount: BigNumber, // assumed to be 18d precision
  tokenOutputAmount: BigNumber,
  virtualPrice = BigNumber.from(10).pow(18),
  isWithdraw = false,
): BigNumber {
  // We want to multiply the lpTokenAmount by virtual price
  // Deposits: (VP * output) / input - 1
  // Swaps: (1 * output) / input - 1
  // Withdraws: output / (input * VP) - 1
  if (tokenInputAmount.lte(0)) return Zero

  return isWithdraw
    ? tokenOutputAmount
        .mul(BigNumber.from(10).pow(36))
        .div(tokenInputAmount.mul(virtualPrice))
        .sub(BigNumber.from(10).pow(18))
    : virtualPrice
        .mul(tokenOutputAmount)
        .div(tokenInputAmount)
        .sub(BigNumber.from(10).pow(18))
}
