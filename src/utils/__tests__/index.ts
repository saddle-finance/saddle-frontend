import { BigNumber } from "@ethersproject/bignumber"
import { calculateExchangeRate } from "../index"
import { parseUnits } from "@ethersproject/units"

describe("calculateExchangeRate", () => {
  it("correctly calculates value for 0 input", () => {
    expect(
      calculateExchangeRate(BigNumber.from(0), 18, BigNumber.from(0), 18),
    ).toEqual(BigNumber.from(0))
  })

  it("correctly calculates value for inputs of same precision", () => {
    expect(
      calculateExchangeRate(parseUnits("1", 9), 9, parseUnits("2", 9), 9),
    ).toEqual(parseUnits("2", 18))
  })

  it("correctly calculates value for inputs of different precisions", () => {
    expect(
      calculateExchangeRate(parseUnits("120", 9), 9, parseUnits(".66", 12), 12),
    ).toEqual(parseUnits("0.0055", 18))
  })
})
