import { BigNumber } from "@ethersproject/bignumber"
import { Zero } from "@ethersproject/constants"
import parseStringToBigNumber from "../parseStringToBigNumber"

describe("parseStringToBigNumber", () => {
  it("correctly parses a string", () => {
    const input = 1.234
    const precision = 8
    expect(parseStringToBigNumber(input.toString(), precision)).toEqual({
      value: BigNumber.from((input * 10 ** precision).toString()),
      isFallback: false,
    })
  })

  it("returns fallback value if the input cannot be parsed", () => {
    const input = "1.23.a"
    const fallback = BigNumber.from(13)
    expect(parseStringToBigNumber(input.toString(), 8, fallback)).toEqual({
      value: fallback,
      isFallback: true,
    })
  })

  it("falls back to 0 if no fallback param provided", () => {
    const input = "1.23.a"
    expect(parseStringToBigNumber(input.toString(), 8)).toEqual({
      value: Zero,
      isFallback: true,
    })
  })
})
