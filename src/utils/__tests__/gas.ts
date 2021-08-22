import { BigNumber } from "@ethersproject/bignumber"
import { GasPrices } from "../../state/user"
import { gasBNFromState } from "../gas"
import { numberInputStateCreator } from "../numberInputState"

describe("gasBNFromState", () => {
  const bn = numberInputStateCreator(0, BigNumber.from(1000))
  const gas = { gasStandard: 1, gasFast: 10, gasInstant: 100 }

  it("get gas from standard", () => {
    expect(gasBNFromState(gas, GasPrices.Standard, bn("314"))).toEqual(
      BigNumber.from("1"),
    )
  })

  it("get gas from fast", () => {
    expect(gasBNFromState(gas, GasPrices.Fast, bn("314"))).toEqual(
      BigNumber.from("10"),
    )
  })

  it("get gas from instant", () => {
    expect(gasBNFromState(gas, GasPrices.Instant, bn("314"))).toEqual(
      BigNumber.from("100"),
    )
  })

  it("get gas from custom", () => {
    expect(gasBNFromState(gas, GasPrices.Custom, bn("314"))).toEqual(
      BigNumber.from("314"),
    )
  })
})
