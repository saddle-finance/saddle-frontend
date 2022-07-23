import { BasicToken, TokensContext } from "../providers/TokensProvider"
import { useContext, useEffect, useState } from "react"
import {
  useGaugeMinterContract,
  useLiquidityGaugeContract,
  useVotingEscrowContract,
} from "./useContract"

import { BigNumber } from "@ethersproject/bignumber"
import { ContractTransaction } from "ethers"
import { GaugeContext } from "../providers/GaugeProvider"
import { GaugeUserReward } from "../utils/gauges"
import { LiquidityGaugeV5 } from "../../types/ethers-contracts/LiquidityGaugeV5"
import { UserStateContext } from "../providers/UserStateProvider"
import { Zero } from "@ethersproject/constants"
import { calculateBoost } from "../utils"
import { useActiveWeb3React } from "."

type UserGauge = {
  stake: LiquidityGaugeV5["deposit(uint256)"]
  unstake: LiquidityGaugeV5["withdraw(uint256)"]
  claim: () => Promise<ContractTransaction[]>
  lpToken: BasicToken
  userWalletLpTokenBalance: BigNumber
  userStakedLpTokenBalance: BigNumber
  hasClaimableRewards: boolean
  userGaugeRewards: GaugeUserReward | null
  boost: BigNumber | null
}

export default function useUserGauge(gaugeAddress?: string): UserGauge | null {
  const { account } = useActiveWeb3React()
  const [veSdlBalance, setVeSdlBalance] = useState(Zero)
  const [totalVeSdl, setTotalVeSdl] = useState(Zero)
  const gaugeContract = useLiquidityGaugeContract(gaugeAddress)
  const gaugeMinterContract = useGaugeMinterContract()
  const { gauges } = useContext(GaugeContext)
  const votingEscrowContract = useVotingEscrowContract()
  const tokens = useContext(TokensContext)
  const userState = useContext(UserStateContext)
  const gauge = Object.values(gauges).find(
    ({ address }) => address === gaugeAddress,
  )
  const lpToken = tokens?.[gauge?.lpTokenAddress ?? ""]

  useEffect(() => {
    const fetchVeSdlBalance = async () => {
      if (votingEscrowContract && account) {
        const veSDLBal = await votingEscrowContract["balanceOf(address)"](
          account,
        )
        setVeSdlBalance(veSDLBal)
        const totalSupply = await votingEscrowContract["totalSupply()"]()
        setTotalVeSdl(totalSupply)
      }
    }

    void fetchVeSdlBalance()
  }, [votingEscrowContract, account])

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

  const {
    gaugeBalance: userLPAmount,
    gaugeTotalSupply: totalLpAmout,
    workingBalances: workingBalance,
    workingSupply,
  } = gauge

  const boost = calculateBoost(
    userLPAmount,
    totalLpAmout,
    workingBalance,
    workingSupply,
    veSdlBalance,
    totalVeSdl,
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
    userGaugeRewards: userGaugeRewards || null,
    boost,
  }
}
