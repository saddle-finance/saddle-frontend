import {
  BTC_POOL_NAME,
  BTC_POOL_TOKENS,
  RENBTC,
  SBTC,
  TBTC,
  WBTC,
} from "../constants"
import React, { ReactElement, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import DepositPage from "../components/DepositPage"
import { formatUnits } from "@ethersproject/units"
import { useApproveAndDeposit } from "../hooks/useApproveAndDeposit"
import usePoolData from "../hooks/usePoolData"
import { useSelector } from "react-redux"
import { useTokenBalance } from "../state/wallet/hooks"
import { useTokenFormState } from "../hooks/useTokenFormState"

// Dumb data start here
const testTransInfoData = {
  isInfo: false,
  content: {
    minimumReceive: 0.083,
    keepTokenValue: "1.34 USD",
    benefit: 1.836,
  },
}

const testDepositData = {
  share: 0.0035,
  lpToken: 80.6942,
}
// Dumb data end here

function DepositBTC(): ReactElement {
  const approveAndDeposit = useApproveAndDeposit(BTC_POOL_NAME)
  const [poolData, userShareData] = usePoolData(BTC_POOL_NAME)
  const [infiniteApproval, setInfiniteApproval] = useState(false)
  const [tokenFormState, updateTokenFormState] = useTokenFormState(
    BTC_POOL_TOKENS,
  )
  const {
    slippageCustom,
    slippageSelected,
    gasPriceSelected,
    gasCustom,
  } = useSelector((state: AppState) => state.user)
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)

  // Account Token balances
  const tokenBalances = {
    [TBTC.symbol]: useTokenBalance(TBTC),
    [WBTC.symbol]: useTokenBalance(WBTC),
    [RENBTC.symbol]: useTokenBalance(RENBTC),
    [SBTC.symbol]: useTokenBalance(SBTC),
  }

  // A represention of tokens used for UI
  const tokens = BTC_POOL_TOKENS.map(({ symbol, name, icon, decimals }) => ({
    symbol,
    name,
    icon,
    max: parseFloat(formatUnits(tokenBalances[symbol], decimals)).toFixed(
      tokenPricesUSD ? tokenPricesUSD[symbol].toFixed(2).length - 2 : 6, // show enough token decimals to represent 0.01 USD
    ),
    inputValue: tokenFormState[symbol].valueRaw,
  }))

  async function onConfirmTransaction(): Promise<void> {
    await approveAndDeposit({
      slippageCustom,
      slippageSelected,
      infiniteApproval,
      tokenFormState,
      gasPriceSelected,
      gasCustom,
    })
    // Clear input after deposit
    updateTokenFormState(
      BTC_POOL_TOKENS.reduce(
        (acc, t) => ({
          ...acc,
          [t.symbol]: "0",
        }),
        {},
      ),
    )
  }
  function updateTokenFormValue(symbol: string, value: string): void {
    updateTokenFormState({ [symbol]: value })
  }

  const depositData = {
    ...testDepositData,
    deposit: BTC_POOL_TOKENS.filter(({ symbol }) =>
      BigNumber.from(tokenFormState[symbol].valueSafe).gt(0),
    ).map(({ symbol, name, icon, decimals }) => ({
      name: name,
      value: formatUnits(tokenFormState[symbol].valueSafe, decimals),
      icon: icon,
    })),
    rates:
      tokenPricesUSD != null
        ? BTC_POOL_TOKENS.filter(({ symbol }) =>
            BigNumber.from(tokenFormState[symbol].valueSafe).gt(0),
          ).map(({ symbol, name, decimals }) => ({
            name: name,
            value: formatUnits(tokenFormState[symbol].valueSafe, decimals),
            rate: tokenPricesUSD[symbol]?.toFixed(2),
          }))
        : [],
  }

  return (
    <DepositPage
      onConfirmTransaction={onConfirmTransaction}
      onChangeTokenInputValue={updateTokenFormValue}
      onChangeInfiniteApproval={(): void =>
        setInfiniteApproval((prev) => !prev)
      }
      title="BTC Pool"
      tokens={tokens}
      poolData={poolData}
      myShareData={userShareData}
      transactionInfoData={testTransInfoData}
      depositDataFromParent={depositData}
      infiniteApproval={infiniteApproval}
    />
  )
}
export default DepositBTC
