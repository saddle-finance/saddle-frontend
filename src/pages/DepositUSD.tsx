import {
  DAI,
  STABLECOIN_POOL_NAME,
  STABLECOIN_POOL_TOKENS,
  SUSD,
  Token,
  USDC,
  USDT,
} from "../constants"
import React, { ReactElement, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import DepositPage from "../components/DepositPage"
import { formatSlippageToString } from "../utils/slippage"
import { formatUnits } from "@ethersproject/units"
import { useApproveAndDeposit } from "../hooks/useApproveAndDeposit"
import usePoolData from "../hooks/usePoolData"
import { useSelector } from "react-redux"
import { useTokenBalance } from "../state/wallet/hooks"
import { useTokenFormState } from "../hooks/useTokenFormState"

// Dumb data start here
const testTransInfoData = {
  isInfo: true,
  content: {
    minimumReceive: 0.083,
    lpTokenValue: "10.34 USD",
    benefit: 1.836,
  },
}

const depositDataFromParentTest = {
  share: 0.000024,
  sadd: 0.325496,
}
// Dumb data end here

function DepositUSD(): ReactElement {
  const poolData = usePoolData(STABLECOIN_POOL_NAME)
  const approveAndDeposit = useApproveAndDeposit(STABLECOIN_POOL_NAME)
  const [infiniteApproval, setInfiniteApproval] = useState(false)
  const [tokenFormState, updateTokenFormValue] = useTokenFormState(
    STABLECOIN_POOL_TOKENS,
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
    [DAI.symbol]: useTokenBalance(DAI),
    [USDC.symbol]: useTokenBalance(USDC),
    [USDT.symbol]: useTokenBalance(USDT),
    [SUSD.symbol]: useTokenBalance(SUSD),
  }

  const tokens = STABLECOIN_POOL_TOKENS.map((token: Token) => ({
    name: token.name,
    symbol: token.symbol,
    icon: token.icon,
    max: tokenBalances[token.symbol],
    inputValue: tokenFormState[token.symbol].valueRaw,
  }))

  function onConfirmTransaction(): Promise<void> {
    return approveAndDeposit({
      slippageCustom,
      slippageSelected,
      infiniteApproval,
      tokenFormState,
      gasPriceSelected,
      gasCustom,
    })
  }
  const depositData = {
    ...depositDataFromParentTest,
    deposit: STABLECOIN_POOL_TOKENS.filter((t) =>
      BigNumber.from(tokenFormState[t.symbol].valueSafe).gt(0),
    ).map((t) => ({
      name: t.name,
      value: formatUnits(tokenFormState[t.symbol].valueSafe, t.decimals),
      icon: t.icon,
    })),
    rates:
      tokenPricesUSD != null
        ? STABLECOIN_POOL_TOKENS.filter((t) =>
            BigNumber.from(tokenFormState[t.symbol].valueSafe).gt(0),
          ).map((t) => ({
            name: t.name,
            value: formatUnits(tokenFormState[t.symbol].valueSafe, t.decimals),
            rate: tokenPricesUSD[t.symbol]?.toFixed(3),
          }))
        : [],
    slippage: formatSlippageToString(slippageSelected, slippageCustom),
  }

  return (
    <DepositPage
      onConfirmTransaction={onConfirmTransaction}
      onChangeTokenInputValue={updateTokenFormValue}
      onChangeInfiniteApproval={(): void =>
        setInfiniteApproval((prev) => !prev)
      }
      title="USD Pool"
      tokens={tokens}
      poolData={poolData}
      transactionInfoData={testTransInfoData}
      myShareData={poolData?.userShare}
      depositDataFromParent={depositData}
      infiniteApproval={infiniteApproval}
    />
  )
}

export default DepositUSD
