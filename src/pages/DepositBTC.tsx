import {
  BTC_POOL_TOKENS,
  RENBTC,
  SBTC,
  TBTC,
  TEST_STABLECOIN_SWAP_ADDRESS,
  WBTC,
} from "../constants"
import React, { ReactElement } from "react"

import DepositPage from "../components/DepositPage"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { useActiveWeb3React } from "../hooks"
import { useTokenBalance } from "../state/wallet/hooks"
import { useTokenContract } from "../hooks/useContract"
import { useTokenFormState } from "../hooks/useTokenFormState"

// Dumb data start here
const testBTCPoolData = {
  name: "BTC Pool",
  fee: 0.04,
  adminFee: 0,
  virtualPrice: 1.0224,
  utilization: 64.02,
  volume: 46555333.11,
  reserve: 142890495.38,
  tokens: [
    {
      name: TBTC.name,
      icon: TBTC.icon,
      percent: 12.34,
      value: 17633722.4,
    },
    {
      name: WBTC.name,
      icon: WBTC.icon,
      percent: 33.98,
      value: 48424123.64,
    },
    {
      name: RENBTC.name,
      icon: RENBTC.icon,
      percent: 38.96,
      value: 55675199.22,
    },
    {
      name: SBTC.name,
      icon: SBTC.icon,
      percent: 14.8,
      value: 21157478.96,
    },
  ],
}

const testTransInfoData = {
  isInfo: false,
  content: {
    minimumReceive: 0.083,
    lpTokenValue: "10.34 USD",
    benefit: 1.836,
  },
}

const testDepositData = {
  deposit: [
    {
      name: TBTC.name,
      value: 2.2,
      icon: TBTC.icon,
    },
    {
      name: WBTC.name,
      value: 8.65,
      icon: WBTC.icon,
    },
  ],
  rates: [
    {
      name: TBTC.name,
      rate: 10902.32,
    },
    {
      name: WBTC.name,
      rate: 10910.11,
    },
  ],
  share: 0.0035,
  sadd: 80.6942,
  slippage: 0.05,
}
// Dumb data end here

function DepositBTC(): ReactElement {
  const { account } = useActiveWeb3React()
  const [tokenFormState, updateTokenFormValue] = useTokenFormState(
    BTC_POOL_TOKENS,
  )

  // Token Contracts
  const tokenContracts = {
    [TBTC.symbol]: useTokenContract(TBTC),
    [WBTC.symbol]: useTokenContract(WBTC),
    [RENBTC.symbol]: useTokenContract(RENBTC),
    [SBTC.symbol]: useTokenContract(SBTC),
  }

  // Account Token balances
  const tokenBalances = {
    [TBTC.symbol]: useTokenBalance(TBTC),
    [WBTC.symbol]: useTokenBalance(WBTC),
    [RENBTC.symbol]: useTokenBalance(RENBTC),
    [SBTC.symbol]: useTokenBalance(SBTC),
  }

  const tokens = BTC_POOL_TOKENS.map((token) => ({
    symbol: token.symbol,
    name: token.name,
    icon: token.icon,
    max: tokenBalances[token.symbol],
    inputValue: tokenFormState[token.symbol].valueRaw,
  }))

  async function approveAndDeposit(): Promise<void> {
    try {
      if (!account) throw new Error("Account is missing")
      // For each token being desposited, check the allowance and approve it if necessary

      await Promise.all(
        BTC_POOL_TOKENS.map((token) => {
          return checkAndApproveTokenForTrade(
            tokenContracts[token.symbol],
            TEST_STABLECOIN_SWAP_ADDRESS,
            account,
            tokenFormState[token.symbol].valueSafe,
          )
        }),
      )
      // TODO(david) actually spend the money
    } catch (e: any) {
      // TODO(david) create a toast component to show errors
      console.error(e)
    }
  }

  return (
    <DepositPage
      onConfirmTransaction={approveAndDeposit}
      onChangeTokenInputValue={updateTokenFormValue}
      title="BTC Pool"
      tokens={tokens}
      poolData={testBTCPoolData}
      transactionInfoData={testTransInfoData}
      depositDataFromParent={testDepositData}
    />
  )
}
export default DepositBTC
