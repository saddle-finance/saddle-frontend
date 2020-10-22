import React, { ReactElement } from "react"

import SwapPage from "../components/SwapPage"
import renbtcLogo from "../assets/icons/renbtc.svg"
import sbtcLogo from "../assets/icons/sbtc.svg"
import tbtcLogo from "../assets/icons/tbtc.svg"
import { useTranslation } from "react-i18next"
import wbtcLogo from "../assets/icons/wbtc.svg"

// Dumb data for UI
const testList = [
  {
    name: "tBTC",
    value: 2.32,
    icon: tbtcLogo,
  },
  {
    name: "wBTC",
    value: 1.45,
    icon: wbtcLogo,
  },
  {
    name: "renBTC",
    value: 0,
    icon: renbtcLogo,
  },
  {
    name: "sBTC",
    value: 0,
    icon: sbtcLogo,
  },
]

const testPrice = {
  pair: "tBTC/wBTC",
  value: 0.987,
}

const selectedTokens = ["tBTC", "wBTC"]
// End of dumb data

function SwapUSD(): ReactElement {
  const { t } = useTranslation()

  const info = {
    isInfo: false,
    message: `${t("estimatedTxCost")} $3.14`,
  }

  const error = {
    isError: false,
    message: t("insufficientBalance"),
  }
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
