import {
  _applySlippage,
  calculateBonusOrSlippage,
  isHighSlippage,
} from "../slippage"

import { BigNumber } from "@ethersproject/bignumber"
import { Slippages } from "../../state/user"
import { numberInputStateCreator } from "../numberInputState"
import { parseUnits } from "@ethersproject/units"

describe("calculateBonusOrSlippage", () => {
  it("correctly calculates value for 0 input", () => {
    expect(
      calculateBonusOrSlippage(
        BigNumber.from(0),
        BigNumber.from(0),
        BigNumber.from(10).pow(18),
      ),
    ).toEqual(BigNumber.from(0))
  })

  it("correctly calculates value for imbalanced / low liquidity pool", () => {
    expect(
      calculateBonusOrSlippage(
        parseUnits("4", 18), // deposit 4 tokens
        parseUnits("2", 18), // receieve 2 back
        parseUnits("1", 18),
      ),
    ).toEqual(parseUnits("-0.5", 18)) // 4/2 == -.5 slippage
  })

  it("correctly calculates value for balanced pool", () => {
    expect(
      calculateBonusOrSlippage(
        parseUnits("4", 18), // deposit 4 tokens
        parseUnits("3.89", 18), // recieve 3.89 back
        parseUnits("1.03", 18),
      ),
    ).toEqual(parseUnits("0.001675", 18))
  })
})

describe("isHighSlippage", () => {
  it("returns true for slippage >= 10%", () => {
    const negTenPct = BigNumber.from(10)
      .pow(18 - 2)
      .mul(-10)
    const negElevenPct = BigNumber.from(10)
      .pow(18 - 2)
      .mul(-11)
    expect(isHighSlippage(negTenPct)).toBe(true)
    expect(isHighSlippage(negElevenPct)).toBe(true)
  })

  it("returns false for slippage < 10%", () => {
    const negNinePct = BigNumber.from(10)
      .pow(18 - 2)
      .mul(-9)
    const posOnePct = BigNumber.from(10).pow(18 - 2)
    expect(isHighSlippage(negNinePct)).toBe(false)
    expect(isHighSlippage(posOnePct)).toBe(false)
    expect(isHighSlippage(BigNumber.from(0))).toBe(false)
  })
})

describe("_applySlippage", () => {
  const input = BigNumber.from(10).pow(8).mul(51)
  const customPrecision = 5
  const createNumberInputState = numberInputStateCreator(
    customPrecision,
    BigNumber.from(10).pow(customPrecision).mul(33), // fallback value, ignore this
  )
  const customNumberState = createNumberInputState("3.05") // custom slippage 3.05%

  it("Calculates 1% subtracted", () => {
    const expectedResult = input.mul(99).div(100)
    expect(_applySlippage(input, Slippages.One, customNumberState)).toEqual(
      expectedResult,
    )
  })

  it("Calculates 0.1% subtracted", () => {
    const expectedResult = input.mul(999).div(1000)
    expect(
      _applySlippage(input, Slippages.OneTenth, customNumberState),
    ).toEqual(expectedResult)
  })

  it("Calculates from custom input subtracted", () => {
    // 51 * (1 - 0.0305) = 49.4445
    const customDenominator = BigNumber.from(10).pow(customPrecision + 2)
    const customNumerator = customDenominator.sub(customNumberState.valueSafe)
    const expectedResult = input.mul(customNumerator).div(customDenominator)
    expect(_applySlippage(input, Slippages.Custom, customNumberState)).toEqual(
      expectedResult,
    )
  })

  it("Calculates 1% added", () => {
    const expectedResult = input.mul(101).div(100)
    expect(
      _applySlippage(input, Slippages.One, customNumberState, true),
    ).toEqual(expectedResult)
  })

  it("Calculates 0.1% added", () => {
    const expectedResult = input.mul(1001).div(1000)
    expect(
      _applySlippage(input, Slippages.OneTenth, customNumberState, true),
    ).toEqual(expectedResult)
  })

  it("Calculates from custom input added", () => {
    // 51 * (1 - 0.0305) = 49.4445
    const customDenominator = BigNumber.from(10).pow(customPrecision + 2)
    const customNumerator = customDenominator.add(customNumberState.valueSafe)
    const expectedResult = input.mul(customNumerator).div(customDenominator)
    expect(
      _applySlippage(input, Slippages.Custom, customNumberState, true),
    ).toEqual(expectedResult)
  })
})
