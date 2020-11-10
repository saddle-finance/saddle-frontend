import { BigNumber } from "@ethersproject/bignumber"
import { WBTC } from "../../constants"
import parseStringToBigNumber from "../parseStringToBigNumber"

describe("parseStringToBigNumber", () => {
  it("returns the correct precision for a token", () => {
    const input = 1.23
    expect(parseStringToBigNumber(input.toString(), "WBTC")).toEqual(
      BigNumber.from((input * 10 ** WBTC.decimals).toString()),
    )
  })

  it("defaults to 18 decimal precision when no symbol is provided", () => {
    const input = 1.23
    expect(parseStringToBigNumber(input.toString())).toEqual(
      BigNumber.from((input * 10 ** 18).toString()),
    )
  })

  it("returns 0 if the input cannot be parsed", () => {
    const input = "1.23.a"
    expect(parseStringToBigNumber(input.toString())).toEqual(BigNumber.from(0))
  })
})
