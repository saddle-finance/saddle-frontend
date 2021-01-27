import { BigNumber } from "@ethersproject/bignumber"

export function isHighPriceImpact(priceImpact: BigNumber): boolean {
  const negOneTenth = BigNumber.from(-10).pow(18 - 1)
  return priceImpact.lte(negOneTenth)
}

export function calculatePriceImpact(
  tokenInputAmount: BigNumber, // assumed to be 18d precision
  tokenOutputAmount: BigNumber,
  virtualPrice: BigNumber,
): BigNumber {
  return tokenInputAmount.gt(0)
    ? virtualPrice
        .mul(tokenOutputAmount)
        .div(tokenInputAmount)
        .sub(BigNumber.from(10).pow(18))
    : BigNumber.from(0)
}
