import parseStringToBigNumber, {
  parseStringAndTokenToBigNumber,
} from "../parseStringToBigNumber"

import { BigNumber } from "@ethersproject/bignumber"
import { WBTC } from "../../constants"
import { Zero } from "@ethersproject/constants"

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

describe("parseStringAndTokenToBigNumber", () => {
  it("returns the correct precision for a token", () => {
    const input = 1.23
    expect(parseStringAndTokenToBigNumber(input.toString(), "WBTC")).toEqual({
      value: BigNumber.from((input * 10 ** WBTC.decimals).toString()),
      isFallback: false,
    })
  })

  it("defaults to 18 decimal precision when no symbol is provided", () => {
    const input = 1.23
    expect(parseStringAndTokenToBigNumber(input.toString())).toEqual({
      value: BigNumber.from((input * 10 ** 18).toString()),
      isFallback: false,
    })
  })

  it("returns 0 if the input cannot be parsed", () => {
    const input = "1.23.a"
    expect(parseStringAndTokenToBigNumber(input.toString())).toEqual({
      value: Zero,
      isFallback: true,
    })
  })
})
