import React, { useState } from "react"
import numbro from "numbro"

import TokenSelector from "./TokenSelector"

interface Props {
  tokenBaskets: string[]
  basketYields: { [key: string]: number }
}

function formatAPY(apyOutOf100: number): string {
  return numbro(apyOutOf100).divide(100).format({
    output: "percent",
    mantissa: 1,
    trimMantissa: true,
  })
}

function EarnForm({ tokenBaskets, basketYields }: Props) {
  const [token, setToken] = useState(tokenBaskets[0] || "USD")

  return (
    <form className="earn">
      <span className="apy">~{formatAPY(basketYields[token] || 0)} APY</span>
      <span className="">
        on your{" "}
        <TokenSelector
          tokens={tokenBaskets}
          onChange={(e) => setToken(e.target.value)}
        />
      </span>
      <button type="button">Earn!</button>
    </form>
  )
}

export default EarnForm
