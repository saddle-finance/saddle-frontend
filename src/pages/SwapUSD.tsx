import React, { ReactElement } from "react"

import SwapPage from "../components/SwapPage"
import daiLogo from "../assets/icons/dai.svg"
import susdLogo from "../assets/icons/susd.svg"
import usdcLogo from "../assets/icons/usdc.svg"
import usdtLogo from "../assets/icons/usdt.svg"

// Dumb data for UI
const testList = [
  {
    name: "DAI",
    value: 11.58,
    icon: daiLogo,
  },
  {
    name: "USDC",
    value: 99.45,
    icon: usdcLogo,
  },
  {
    name: "USDT",
    value: 0,
    icon: usdtLogo,
  },
  {
    name: "sUSD",
    value: 0,
    icon: susdLogo,
  },
]

const testPrice = {
  pair: "DAI/USDC",
  value: 1.0261,
}

const selectedTokens = ["DAI", "USDT"]

const error = {
  isError: true,
  message: "Insufficient balance",
}

const info = {
  isInfo: true,
  message: "Estimated TX Cost $3.14",
}
// End of dumb data

function SwapUSD(): ReactElement {
  return (
    <SwapPage
      tokens={testList}
      rate={testPrice}
      selectedTokens={selectedTokens}
      error={error}
      info={info}
    />
  )
}

export default SwapUSD
