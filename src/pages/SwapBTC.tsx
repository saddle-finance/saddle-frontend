import React from "react"
import SwapPage from "../components/SwapPage"

// Dumb data for UI
const testList = [
  {
    name: "tBTC",
    value: 2.32,
    icon: require("../assets/icons/tbtc.svg"),
  },
  {
    name: "wBTC",
    value: 1.45,
    icon: require("../assets/icons/wbtc.svg"),
  },
  {
    name: "renBTC",
    value: 0,
    icon: require("../assets/icons/renbtc.svg"),
  },
  {
    name: "sBTC",
    value: 0,
    icon: require("../assets/icons/sbtc.svg"),
  },
]

const testPrice = {
  pair: "tBTC/wBTC",
  value: 0.987,
}

const selectedTokens = ["tBTC", "wBTC"]

const error = {
  isError: false,
  message: "Insufficient balance",
}

const info = {
  isInfo: false,
  message: "Estimated TX Cost $3.14",
}

const advanced = false
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
