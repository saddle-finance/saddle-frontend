import { BasicToken, TokensContext } from "../providers/TokensProvider"

import { BigNumber } from "@ethersproject/bignumber"
import { GaugeContext } from "../providers/GaugeProvider"
import { LiquidityGaugeV5 } from "../../types/ethers-contracts/LiquidityGaugeV5"
import { UserStateContext } from "../providers/UserStateProvider"
import { Zero } from "@ethersproject/constants"
import { useActiveWeb3React } from "."
import { useContext } from "react"
import { useLiquidityGaugeContract } from "./useContract"

type UserGauge = {
  stake: LiquidityGaugeV5["deposit(uint256)"]
  unstake: LiquidityGaugeV5["withdraw(uint256)"]
  claim: () => ReturnType<LiquidityGaugeV5["claim_rewards(address)"]>
  lpToken: BasicToken
  userWalletLpTokenBalance: BigNumber
  userStakedLpTokenBalance: BigNumber
}

// TODO add rewards
export default function useUserGauge(gaugeAddress?: string): UserGauge | null {
  const { account } = useActiveWeb3React()
  const gaugeContract = useLiquidityGaugeContract(gaugeAddress)
  const { gauges } = useContext(GaugeContext)
  const tokens = useContext(TokensContext)
  const userState = useContext(UserStateContext)
  const gauge = Object.values(gauges).find(
    ({ address }) => address === gaugeAddress,
  )
  const lpToken = tokens?.[gauge?.lpTokenAddress ?? ""]

  if (
    !gaugeAddress ||
    !gaugeContract ||
    !gauge ||
    !lpToken ||
    !account ||
    !userState
  )
    return null
  console.log(gaugeAddress, gauge.gaugeName)
  return {
    stake: gaugeContract["deposit(uint256)"],
    unstake: gaugeContract["withdraw(uint256)"],
    claim: () => gaugeContract["claim_rewards(address)"](account),
    lpToken,
    userWalletLpTokenBalance:
      userState.tokenBalances?.[lpToken.address] || Zero,
    userStakedLpTokenBalance:
      userState.gaugeRewards?.[gaugeAddress]?.amountStaked || Zero,
  }
}
