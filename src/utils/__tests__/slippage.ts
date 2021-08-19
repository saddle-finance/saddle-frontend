import { _applySlippage, formatSlippageToString } from "../slippage"
import { BigNumber } from "@ethersproject/bignumber"
import { Slippages } from "../../state/user"
import { numberInputStateCreator } from "../numberInputState"

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

describe("formatSlippageToString", () => {
  it("formats slippages one to string", () => {
    expect(formatSlippageToString(Slippages.One, undefined)).toBe("1.0")
  })
  it("formats slippages custom without custom to give N/A", () => {
    expect(formatSlippageToString(Slippages.Custom, undefined)).toBe("N/A")
  })

  const createNumberInputState = numberInputStateCreator(
    5,
    BigNumber.from(10).pow(5).mul(33),
  )

  it("formats slippages custom with custom", () => {
    expect(
      formatSlippageToString(
        Slippages.Custom,
        createNumberInputState("3.14159"),
      ),
    ).toBe("3.14159")
  })
})
