import { BasicToken, TokensContext } from "../providers/TokensProvider"
import {
  useGaugeMinterContract,
  useLiquidityGaugeContract,
} from "./useContract"

import { BigNumber } from "@ethersproject/bignumber"
import { ContractTransaction } from "ethers"
import { GaugeContext } from "../providers/GaugeProvider"
import { LiquidityGaugeV5 } from "../../types/ethers-contracts/LiquidityGaugeV5"
import { UserStateContext } from "../providers/UserStateProvider"
import { Zero } from "@ethersproject/constants"
import { useActiveWeb3React } from "."
import { useContext } from "react"

type UserGauge = {
  stake: LiquidityGaugeV5["deposit(uint256)"]
  unstake: LiquidityGaugeV5["withdraw(uint256)"]
  claim: () => Promise<ContractTransaction[]>
  lpToken: BasicToken
  userWalletLpTokenBalance: BigNumber
  userStakedLpTokenBalance: BigNumber
  hasClaimableRewards: boolean
}

// TODO add rewards
export default function useUserGauge(gaugeAddress?: string): UserGauge | null {
  const { account } = useActiveWeb3React()
  const gaugeContract = useLiquidityGaugeContract(gaugeAddress)
  const gaugeMinterContract = useGaugeMinterContract()
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
    !userState ||
    !gaugeMinterContract
  )
    return null

  const userGaugeRewards = userState.gaugeRewards?.[gaugeAddress]
  const hasSDLRewards = Boolean(userGaugeRewards?.claimableSDL.gt(Zero))
  const hasExternalRewards = Boolean(
    userGaugeRewards?.claimableExternalRewards.length,
  )

  return {
    stake: gaugeContract["deposit(uint256)"],
    unstake: gaugeContract["withdraw(uint256)"],
    claim: () => {
      const promises = [gaugeMinterContract.mint(gaugeAddress)]
      if (hasExternalRewards) {
        promises.push(gaugeContract["claim_rewards(address)"](account))
      }
      return Promise.all(promises)
    },
    hasClaimableRewards: hasSDLRewards || hasExternalRewards,
    lpToken,
    userWalletLpTokenBalance:
      userState.tokenBalances?.[lpToken.address] || Zero,
    userStakedLpTokenBalance: userGaugeRewards?.amountStaked || Zero,
  }
}
