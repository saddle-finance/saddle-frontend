import React, { useState } from "react"
import { connect, ConnectedProps } from "react-redux"
import numbro from "numbro"

import TokenSelector from "./TokenSelector"
import { Swap } from "../types"

function formatAPY(apyOutOf100: number): string {
  return numbro(apyOutOf100).divide(100).format({
    output: "percent",
    mantissa: 1,
    trimMantissa: true,
  })
}

const mapStateToProps = (state: { swaps: { all: Swap[] } }) => {
  return { swaps: state.swaps.all }
}

const connector = connect(mapStateToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & {
  swapYields: { [key: string]: number }
}

function EarnForm({ swaps, swapYields }: Props) {
  const [swapName, setSwap] = useState(swaps.length > 0 ? swaps[0].name : "USD")

  return (
    <form className="earn">
      <span className="apy">~{formatAPY(swapYields[swapName] || 0)} APY</span>
      <span className="">
        on your{" "}
        <TokenSelector
          tokens={swaps.map((s) => s.name)}
          onChange={(e) => setSwap(e.target.value)}
        />
      </span>
      <button type="button">Earn!</button>
    </form>
  )
}

export default connector(EarnForm)
