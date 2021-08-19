import { PoolTypes, TOKENS_MAP } from "../../constants/index"
import {
  calculateExchangeRate,
  calculatePrice,
  commify,
  formatBNToShortString,
  formatDeadlineToNumber,
  getTokenByAddress,
  getTokenSymbolForPoolType,
  intersection,
} from "../index"

import { BigNumber } from "@ethersproject/bignumber"
import { Deadlines } from "../../state/user"
import { Zero } from "@ethersproject/constants"
import { parseUnits } from "@ethersproject/units"

describe("formatBNToShortString", () => {
  const testCases = [
    ["decimals", parseUnits("1234", 0), 5, "0.0"],
    ["hundreds", parseUnits("123", 1), 1, "123.0"],
    ["thousands", parseUnits("5432", 0), 0, "5.4k"],
    ["millions", parseUnits("66711111", 3), 3, "66.7m"],
    ["billions", parseUnits("999311111111", 5), 5, "999.3b"],
    ["trillions", parseUnits("1911111111111", 8), 8, "1.9t"],
  ] as const
  testCases.forEach(([type, input, decimals, expected]) => {
    it(`correctly formats ${type}`, () => {
      expect(formatBNToShortString(input, decimals)).toEqual(expected)
    })
  })
})

describe("getTokenByAddress", () => {
  it("correctly fetches a token", () => {
    const chainId = 1
    const target = TOKENS_MAP["sBTC"]
    expect(getTokenByAddress(target.addresses[chainId], chainId)).toEqual(
      target,
    )
  })
  it("correctly does not find a token", () => {
    expect(getTokenByAddress("", 1)).toEqual(null)
  })
})

describe("intersection", () => {
  it("correctly intersects two sets", () => {
    const setA = new Set([1, 2, 3, 4])
    const setB = new Set([3, 4, 5, 6])
    expect(intersection(setA, setB)).toEqual(new Set([3, 4]))
  })
})

describe("calculateExchangeRate", () => {
  it("correctly calculates value for 0 input", () => {
    expect(calculateExchangeRate(Zero, 18, Zero, 18)).toEqual(Zero)
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

describe("commify", () => {
  it("correctly commifies", () => {
    expect(commify("")).toEqual("")
    expect(commify(".")).toEqual(".")
    expect(commify(".0")).toEqual(".0")
    expect(commify("123")).toEqual("123")
    expect(commify("1234")).toEqual("1,234")
    expect(commify("12345.")).toEqual("12,345.")
    expect(commify("12345.0")).toEqual("12,345.0")
    expect(commify("123456.78")).toEqual("123,456.78")
  })
  it("throws an error for invalid input", () => {
    expect(() => commify("123..")).toThrow()
  })
})

describe("formatDeadlineToNumber", () => {
  it("correctly formats 10 to number", () => {
    expect(formatDeadlineToNumber(Deadlines.Ten, undefined)).toEqual(10)
  })
  it("correctly formats 20 to number", () => {
    expect(formatDeadlineToNumber(Deadlines.Twenty, undefined)).toEqual(20)
  })
  it("correctly formats 30 to number", () => {
    expect(formatDeadlineToNumber(Deadlines.Thirty, undefined)).toEqual(30)
  })
  it("correctly formats 40 to number", () => {
    expect(formatDeadlineToNumber(Deadlines.Forty, undefined)).toEqual(40)
  })

  it("correctly formats custom deadline to number", () => {
    expect(formatDeadlineToNumber(Deadlines.Custom, "23")).toEqual(23)
  })
  it("correctly formats empty custom deadline to default", () => {
    expect(formatDeadlineToNumber(Deadlines.Custom, "")).toEqual(20)
  })
})

describe("getTokenSymbolForPoolType", () => {
  it("correctly gets token symbol for btc pool", () => {
    expect(getTokenSymbolForPoolType(PoolTypes.BTC)).toBe("WBTC")
  })
  it("correctly gets token symbol for eth pool", () => {
    expect(getTokenSymbolForPoolType(PoolTypes.ETH)).toBe("WETH")
  })
  it("correctly gets token symbol for usd pool", () => {
    expect(getTokenSymbolForPoolType(PoolTypes.USD)).toBe("USDC")
  })
  it("correctly gets nothing for other pool", () => {
    expect(getTokenSymbolForPoolType(PoolTypes.OTHER)).toBe("")
  })
})

describe("calculatePrice", () => {
  it("correctly gets Zero for an empty price", () => {
    expect(calculatePrice(BigNumber.from(1), 0, undefined)).toBe(Zero)
  })
})
