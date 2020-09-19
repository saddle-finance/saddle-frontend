import React from "react"
import SwapPage from "../components/SwapPage"

// Dumb data for UI
const testList = [
  {
    name: "DAI",
    value: 11.58,
    icon: require("../assets/icons/dai.svg"),
  },
  {
    name: "USDC",
    value: 99.45,
    icon: require("../assets/icons/usdc.svg"),
  },
  {
    name: "USDT",
    value: 0,
    icon: require("../assets/icons/usdt.svg"),
  },
  {
    name: "sUSD",
    value: 0,
    icon: require("../assets/icons/susd.svg"),
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

const advanced = true
// End of dumb data

function SwapUSD() {
  return (
    <SwapPage
      tokens={testList}
      rate={testPrice}
      selectedTokens={selectedTokens}
      error={error}
      info={info}
      advanced={advanced}
    />
  )
}

export default SwapUSD
