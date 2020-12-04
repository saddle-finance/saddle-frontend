import { BTC_POOL_NAME, BTC_POOL_TOKENS, Token } from "../constants"
import React, { ReactElement } from "react"
import WithdrawPage, { ReviewWithdrawData } from "../components/WithdrawPage"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { formatSlippageToString } from "../utils/slippage"
import { formatUnits } from "@ethersproject/units"
import usePoolData from "../hooks/usePoolData"
import { useSelector } from "react-redux"
import useWithdrawFormState from "../hooks/useWithdrawFormState"

// Dumb data start here
const testTransInfoData = {
  isInfo: false,
  content: {
    lpTokenValue: "10.34 USD",
    benefit: 1.836,
  },
}
// Dumb data end here

function WithdrawBTC(): ReactElement {
  const [poolData, userShareData] = usePoolData(BTC_POOL_NAME)
  const [withdrawFormState, updateWithFormState] = useWithdrawFormState(
    BTC_POOL_NAME,
  )
  const { slippageCustom, slippageSelected } = useSelector(
    (state: AppState) => state.user,
  )
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)

  const tokensData = React.useMemo(
    () =>
      BTC_POOL_TOKENS.map((token: Token, i) => ({
        name: token.name,
        symbol: token.symbol,
        icon: token.icon,
        inputValue: withdrawFormState.tokenInputs[i].valueRaw,
      })),
    [withdrawFormState],
  )

  const reviewWithdrawData: ReviewWithdrawData = {
    withdraw: [],
    rates: [],
    slippage: formatSlippageToString(slippageSelected, slippageCustom),
  }
  BTC_POOL_TOKENS.forEach((token, i) => {
    if (BigNumber.from(withdrawFormState.tokenInputs[i].valueSafe).gt(0)) {
      reviewWithdrawData.withdraw.push({
        name: token.name,
        value: formatUnits(
          withdrawFormState.tokenInputs[i].valueSafe,
          token.decimals,
        ),
        icon: token.icon,
      })
      if (tokenPricesUSD != null) {
        reviewWithdrawData.rates.push({
          name: token.name,
          value: formatUnits(
            withdrawFormState.tokenInputs[i].valueSafe,
            token.decimals,
          ),
          rate: tokenPricesUSD[token.symbol]?.toFixed(3),
        })
      }
    }
  })

  return (
    <WithdrawPage
      title="BTC Pool"
      reviewData={reviewWithdrawData}
      tokensData={tokensData}
      poolData={poolData}
      transactionInfoData={testTransInfoData}
      myShareData={userShareData}
      formStateData={withdrawFormState}
      onFormChange={updateWithFormState}
    />
  )
}

export default WithdrawBTC
