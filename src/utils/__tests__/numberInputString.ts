import { BigNumber } from "@ethersproject/bignumber"
import { numberInputStateCreator } from "../numberInputState"

describe("numberInputStateCreator", () => {
  it("returns a function", () => {
    expect(typeof numberInputStateCreator(1, BigNumber.from(1))).toEqual(
      "function",
    )
  })
  it("uses the provided precision", () => {
    const fn1 = numberInputStateCreator(0, BigNumber.from(1))
    const fn2 = numberInputStateCreator(5, BigNumber.from(1))
    expect(fn1("123")).toEqual({
      isValid: true,
      isEmpty: false,
      valueRaw: "123",
      valueSafe: "123",
      precision: 0,
    })
    expect(fn2("123")).toEqual({
      isValid: true,
      isEmpty: false,
      valueRaw: "123",
      valueSafe: "12300000",
      precision: 5,
    })
  })
  it("works for decimals", () => {
    const fn1 = numberInputStateCreator(8, BigNumber.from(1))
    expect(fn1("9.8765")).toEqual({
      isValid: true,
      isEmpty: false,
      valueRaw: "9.8765",
      valueSafe: "987650000",
      precision: 8,
    })
  })
  it("correctly identifies an empty value", () => {
    const fallback = BigNumber.from(1)
    const fn = numberInputStateCreator(1, fallback)
    expect(fn("")).toEqual({
      isValid: false,
      isEmpty: true,
      valueRaw: "",
      valueSafe: fallback.toString(),
      precision: 1,
    })
  })
  it("correctly identifies an invalid value", () => {
    const fallback = BigNumber.from(1)
    const fn = numberInputStateCreator(1, fallback)
    expect(fn("1..a")).toEqual({
      isValid: false,
      isEmpty: false,
      valueRaw: "1..a",
      valueSafe: fallback.toString(),
      precision: 1,
    })
  })
})
