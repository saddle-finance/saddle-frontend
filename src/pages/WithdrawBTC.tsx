import { BTC_POOL_NAME, BTC_POOL_TOKENS } from "../constants"
import React, { ReactElement, useState } from "react"
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
  isInfo: true,
  content: {
    keepTokenValue: "1.34 USD",
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
  const [infiniteApproval, setInfiniteApproval] = useState(false)

  const tokensData = React.useMemo(
    () =>
      BTC_POOL_TOKENS.map(({ name, symbol, icon }) => ({
        name,
        symbol,
        icon,
        inputValue: withdrawFormState.tokenInputs[symbol].valueRaw,
      })),
    [withdrawFormState],
  )

  const reviewWithdrawData: ReviewWithdrawData = {
    withdraw: [],
    rates: [],
    slippage: formatSlippageToString(slippageSelected, slippageCustom),
  }
  BTC_POOL_TOKENS.forEach(({ name, decimals, icon, symbol }) => {
    if (BigNumber.from(withdrawFormState.tokenInputs[symbol].valueSafe).gt(0)) {
      reviewWithdrawData.withdraw.push({
        name,
        value: formatUnits(
          withdrawFormState.tokenInputs[symbol].valueSafe,
          decimals,
        ),
        icon,
      })
      if (tokenPricesUSD != null) {
        reviewWithdrawData.rates.push({
          name,
          value: formatUnits(
            withdrawFormState.tokenInputs[symbol].valueSafe,
            decimals,
          ),
          rate: tokenPricesUSD[symbol]?.toFixed(3),
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
      infiniteApproval={infiniteApproval}
      onChangeInfiniteApproval={(): void =>
        setInfiniteApproval((prevState) => !prevState)
      }
    />
  )
}

export default WithdrawBTC
