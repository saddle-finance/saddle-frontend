import { DAI, SUSD, USDC, USDT } from "../constants"
import React, { ReactElement } from "react"

import SwapPage from "../components/SwapPage"
import daiLogo from "../assets/icons/dai.svg"
import susdLogo from "../assets/icons/susd.svg"
import usdcLogo from "../assets/icons/usdc.svg"
import usdtLogo from "../assets/icons/usdt.svg"
import { useTokenBalance } from "../state/wallet/hooks"
import { useTranslation } from "react-i18next"

// Dumb data for UI
const testPrice = {
  pair: "DAI/USDC",
  value: 1.0261,
}
// End of dumb data

function SwapUSD(): ReactElement {
  const { t } = useTranslation()
  const [selectedTokenFrom, setSelectedTokenFrom] = React.useState(
    testList[0].name,
  )
  const [selectedTokenTo, setSelectedTokenTo] = React.useState(testList[1].name)

  const daiBalance = useTokenBalance(DAI)
  const usdcBalance = useTokenBalance(USDC)
  const usdtBalance = useTokenBalance(USDT)
  const susdBalance = useTokenBalance(SUSD)

  const tokens = [
    {
      name: "DAI",
      value: daiBalance,
      icon: daiLogo,
    },
    {
      name: "USDC",
      value: usdcBalance,
      icon: usdcLogo,
    },
    {
      name: "USDT",
      value: usdtBalance,
      icon: usdtLogo,
    },
    {
      name: "sUSD",
      value: susdBalance,
      icon: susdLogo,
    },
  ]

  const info = {
    isInfo: true,
    message: `${t("estimatedTxCost")} $3.14`,
  }

  const error = {
    isError: true,
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
