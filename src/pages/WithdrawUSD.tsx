import React, { ReactElement } from "react"
import {
  STABLECOIN_POOL_NAME,
  STABLECOIN_POOL_TOKENS,
  Token,
} from "../constants"

import WithdrawPage from "../components/WithdrawPage"
import usePoolData from "../hooks/usePoolData"
import { useTokenFormState } from "../hooks/useTokenFormState"

// Dumb data start here
const testTransInfoData = {
  isInfo: false,
  content: {
    lpTokenValue: "10.34 USD",
    benefit: 1.836,
  },
}
// Dumb data end here

function WithdrawUSD(): ReactElement {
  const poolData = usePoolData(STABLECOIN_POOL_NAME)
  const [tokenFormState, updateTokenFormValue] = useTokenFormState(
    STABLECOIN_POOL_TOKENS,
  )
  const tokens = STABLECOIN_POOL_TOKENS.map((token: Token, i) => ({
    name: token.name,
    symbol: token.symbol,
    icon: token.icon,
    max: Number(poolData?.userShare?.tokens[i]?.value || 0), // TODO: clean this up
    inputValue: tokenFormState[token.symbol].valueRaw,
  }))
  return (
    <WithdrawPage
      onChangeTokenInputValue={updateTokenFormValue}
      title="USD Pool"
      tokensData={tokens}
      poolData={poolData}
      transactionInfoData={testTransInfoData}
      myShareData={poolData?.userShare}
    />
  )
}

export default WithdrawUSD
