import { getEtherscanLink } from "../getEtherscanLink"

describe("getEtherscanLink", () => {
  it("returns the etherscan link for a tx", () => {
    expect(
      getEtherscanLink(
        "0x1ce9355fc416959d57442a6a57c44b9a3fc9d700f7bbdbdba54c3b171f82140b",
        "tx",
      ),
    ).toBe(
      "https://etherscan.io/tx/0x1ce9355fc416959d57442a6a57c44b9a3fc9d700f7bbdbdba54c3b171f82140b",
    )
  })

  it("returns the etherscan link for an address", () => {
    expect(
      getEtherscanLink("0xcd7587dd215ca6002c51f48c082af2d3fc77a6ca", "address"),
    ).toBe(
      "https://etherscan.io/address/0xcd7587dd215ca6002c51f48c082af2d3fc77a6ca",
    )
  })

  it("returns the etherscan link for a block", () => {
    expect(getEtherscanLink("12979165", "block")).toBe(
      "https://etherscan.io/block/12979165",
    )
  })

  it("returns the etherscan link for a token", () => {
    expect(
      getEtherscanLink("0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0", "token"),
    ).toBe(
      "https://etherscan.io/token/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
    )
  })
})
