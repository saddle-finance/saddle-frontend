import { BigNumber } from "@ethersproject/bignumber"
import { minBigNumber } from "../minBigNumber"

describe("Compare bignumber", () => {
  it("compare two number", () => {
    const largeNumber = BigNumber.from(1000)
    const smallNumber = BigNumber.from(10)
    expect(minBigNumber(largeNumber, smallNumber)).toEqual(smallNumber)
  })
})
