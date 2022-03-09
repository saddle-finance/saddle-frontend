import { ChainId, POOLS_MAP } from "../../constants"
import { getPoolByAddress } from "../getPoolByAddress"

describe("getPoolByAddress", () => {
  it("gets pool by address", () => {
    // do we want to require the address we pass in to be lowercase?
    expect(
      getPoolByAddress(
        "0x4f6A43Ad7cba042606dECaCA730d4CE0A57ac62e".toLowerCase(),
        ChainId.MAINNET,
      ),
    ).toBe(POOLS_MAP["BTC"])
  })
})
