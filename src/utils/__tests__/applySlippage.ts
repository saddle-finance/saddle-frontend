import { BigNumber } from "@ethersproject/bignumber"
import { Slippages } from "../../state/user"
import { applySlippage } from "../slippage"
import { numberInputStateCreator } from "../numberInputState"

describe("applySlippage", () => {
  const input = BigNumber.from(10).pow(8).mul(51)
  const customPrecision = 5
  const createNumberInputState = numberInputStateCreator(
    customPrecision,
    BigNumber.from(10).pow(customPrecision).mul(33), // fallback value, ignore this
  )
  const customNumberState = createNumberInputState("3.05") // custom slippage 3.05%

  it("Calculates 1%", () => {
    const expectedResult = input.mul(99).div(100)
    expect(applySlippage(input, Slippages.One, customNumberState)).toEqual(
      expectedResult,
    )
  })

  it("Calculates 0.1%", () => {
    const expectedResult = input.mul(999).div(1000)
    expect(applySlippage(input, Slippages.OneTenth, customNumberState)).toEqual(
      expectedResult,
    )
  })

  it("Calculates from custom input", () => {
    // 51 * (1 - 0.0305) = 49.4445
    const customDenominator = BigNumber.from(10).pow(customPrecision + 2)
    const customNumerator = customDenominator.sub(customNumberState.valueSafe)
    const expectedResult = input.mul(customNumerator).div(customDenominator)
    expect(applySlippage(input, Slippages.Custom, customNumberState)).toEqual(
      expectedResult,
    )
  })
})
