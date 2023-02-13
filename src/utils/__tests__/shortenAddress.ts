import { shortenAddress } from "../shortenAddress"

describe("shortenAddress", () => {
  it("catches an error for a bad address", () => {
    expect(shortenAddress("yo what up waleed")).toBe("")
  })

  it("shortens address", () => {
    expect(shortenAddress("0xcd7587dd215ca6002c51f48c082af2d3fc77a6ca")).toBe(
      "0xcD75...A6cA",
    )
  })

  it("shortens address", () => {
    expect(
      shortenAddress("0xcd7587dd215ca6002c51f48c082af2d3fc77a6ca", 5),
    ).toBe("0xcD758...7A6cA")
  })
})
