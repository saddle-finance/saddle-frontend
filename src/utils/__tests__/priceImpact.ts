import { calculatePriceImpact, isHighPriceImpact } from "../priceImpact"

import { BigNumber } from "@ethersproject/bignumber"
import { Zero } from "@ethersproject/constants"
import { parseUnits } from "@ethersproject/units"

describe("calculatePriceImpact", () => {
  it("correctly calculates value for 0 input", () => {
    expect(
      calculatePriceImpact(Zero, Zero, BigNumber.from(10).pow(18)),
    ).toEqual(Zero)
  })

  it("correctly calculates value for imbalanced / low liquidity pool", () => {
    expect(
      calculatePriceImpact(
        parseUnits("4", 18), // deposit 4 tokens
        parseUnits("2", 18), // receieve 2 back
        parseUnits("1", 18),
      ),
    ).toEqual(parseUnits("-0.5", 18)) // 4/2 == -.5 slippage
  })

  it("correctly calculates value for balanced pool", () => {
    expect(
      calculatePriceImpact(
        parseUnits("4", 18), // deposit 4 tokens
        parseUnits("3.89", 18), // recieve 3.89 back
        parseUnits("1.03", 18),
      ),
    ).toEqual(parseUnits("0.001675", 18))
  })

  it("correctly uses a default virtualPrice of 1", () => {
    expect(
      calculatePriceImpact(
        parseUnits("4", 18), // deposit 4 tokens
        parseUnits("2", 18), // recieve 2 back
      ),
    ).toEqual(parseUnits("-.5", 18))
  })

  it("correctly calculates value for negative imbalanced withdraw", () => {
    // 9 / 10 * 1.01 - 1 = -0.10891089108910891
    expect(
      calculatePriceImpact(
        parseUnits("10", 18), // give 10 lpTokens
        parseUnits("9", 18), // receive 9 pool tokens
        parseUnits("1.01", 18),
        true,
      ),
    ).toEqual(parseUnits("-.108910891089108911", 18))
  })

  it("correctly calculates value for posiive imbalanced withdraw", () => {
    // 11 / 10 * 1.01 - 1 = .089108910
    expect(
      calculatePriceImpact(
        parseUnits("10", 18), // give 10 lpTokens
        parseUnits("11", 18), // receive 9 pool tokens
        parseUnits("1.01", 18),
        true,
      ),
    ).toEqual(parseUnits("0.089108910891089108", 18))
  })
})

describe("isHighPriceImpact", () => {
  it("returns true for impact >= 1%", () => {
    const negOnePct = BigNumber.from(10)
      .pow(18 - 2)
      .mul(-1)
    const negTwoPct = BigNumber.from(10)
      .pow(18 - 2)
      .mul(-2)
    expect(isHighPriceImpact(negOnePct)).toBe(true)
    expect(isHighPriceImpact(negTwoPct)).toBe(true)
  })

  it("returns false for impact < 1%", () => {
    const posOnePct = BigNumber.from(10).pow(18 - 2)
    expect(isHighPriceImpact(posOnePct)).toBe(false)
    expect(isHighPriceImpact(Zero)).toBe(false)
  })
})
