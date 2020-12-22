import { BTC_POOL_TOKENS, RENBTC, SBTC, TBTC, WBTC } from "../constants"
import React, { ReactElement } from "react"

import { AppState } from "../state"
import SwapPage from "../components/SwapPage"
import { formatUnits } from "@ethersproject/units"
import { useSelector } from "react-redux"
import { useTokenBalance } from "../state/wallet/hooks"
import { useTranslation } from "react-i18next"

// Dumb data for UI
const testPrice = {
  pair: "tBTC/wBTC",
  value: 0.987,
}
// End of dumb data

function SwapUSD(): ReactElement {
  const { t } = useTranslation()
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)

  const tokenBalances = {
    [TBTC.symbol]: useTokenBalance(TBTC),
    [WBTC.symbol]: useTokenBalance(WBTC),
    [RENBTC.symbol]: useTokenBalance(RENBTC),
    [SBTC.symbol]: useTokenBalance(SBTC),
  }

  const tokens = BTC_POOL_TOKENS.map(({ symbol, name, icon, decimals }) => ({
    name,
    icon,
    value: parseFloat(formatUnits(tokenBalances[symbol], decimals)).toFixed(
      tokenPricesUSD?.[symbol]
        ? tokenPricesUSD[symbol].toFixed(2).length - 2
        : 6, // add enough decimals to represent 0.01 USD
    ),
  }))

  const [selectedTokenFrom, setSelectedTokenFrom] = React.useState(
    tokens[0].name,
  )
  const [selectedTokenTo, setSelectedTokenTo] = React.useState(tokens[1].name)

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
      selectedTokenFrom={selectedTokenFrom}
      selectedTokenTo={selectedTokenTo}
      onSelectTokenFrom={setSelectedTokenFrom}
      onSelectTokenTo={setSelectedTokenTo}
      error={error}
      info={info}
    />
  )
}

export default SwapUSD
