import { RENBTC, SBTC, TBTC, WBTC } from "../constants"
import React, { ReactElement } from "react"

import SwapPage from "../components/SwapPage"
import renbtcLogo from "../assets/icons/renbtc.svg"
import sbtcLogo from "../assets/icons/sbtc.svg"
import tbtcLogo from "../assets/icons/tbtc.svg"
import { useTokenBalance } from "../state/wallet/hooks"
import { useTranslation } from "react-i18next"
import wbtcLogo from "../assets/icons/wbtc.svg"

// Dumb data for UI
const testPrice = {
  pair: "tBTC/wBTC",
  value: 0.987,
}

const selectedTokens = ["tBTC", "wBTC"]
// End of dumb data

function SwapUSD(): ReactElement {
  const { t } = useTranslation()

  const tbtcBalance = useTokenBalance(TBTC)
  const wbtcBalance = useTokenBalance(WBTC)
  const renbtcBalance = useTokenBalance(RENBTC)
  const sbtcBalance = useTokenBalance(SBTC)

  const tokens = [
    {
      name: "tBTC",
      value: tbtcBalance,
      icon: tbtcLogo,
    },
    {
      name: "wBTC",
      value: wbtcBalance,
      icon: wbtcLogo,
    },
    {
      name: "renBTC",
      value: renbtcBalance,
      icon: renbtcLogo,
    },
    {
      name: "sBTC",
      value: sbtcBalance,
      icon: sbtcLogo,
    },
  ]

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
      tokens={tokens}
      rate={testPrice}
      selectedTokens={selectedTokens}
      error={error}
      info={info}
    />
  )
}

export default SwapUSD
