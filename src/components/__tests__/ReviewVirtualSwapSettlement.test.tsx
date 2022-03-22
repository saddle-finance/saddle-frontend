import React from "react"
import ReviewVirtualSwapSettlement from "../ReviewVirtualSwapSettlement"
import { SWAP_TYPES } from "../../constants"
import { Zero } from "@ethersproject/constants"
import { render } from "@testing-library/react"

test("loads component and renders", () => {
  const { debug } = render(
    <ReviewVirtualSwapSettlement
      onClose={() => undefined}
      onConfirm={() => undefined}
      data={{
        from: { symbol: "symbolTest", value: "valueTest" },
        to: { symbol: "toSymbolTest", value: "valueSymbolTest" },
        swapType: SWAP_TYPES.SYNTH_TO_TOKEN,
        exchangeRateInfo: {
          pair: "pairTest",
          exchangeRate: Zero,
          priceImpact: Zero,
        },
      }}
    />,
  )
  debug()
})
