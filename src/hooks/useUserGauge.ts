import { BasicToken, TokensContext } from "../providers/TokensProvider"
import { SetStateAction, useContext, useEffect, useState } from "react"
import {
  getChildGaugeFactory,
  getChildOracle,
  getGaugeContract,
  getGaugeMinterContract,
  getVotingEscrowContract,
} from "./useContract"
import { BigNumber } from "@ethersproject/bignumber"
import { ChainId } from "../constants"
import { ContractTransaction } from "ethers"
import { GaugeContext } from "../providers/GaugeProvider"
import { GaugeUserReward } from "../utils/gauges"
import { LiquidityGaugeV5 } from "../../types/ethers-contracts/LiquidityGaugeV5"
import { RegistryAddressContext } from "../providers/RegistryAddressProvider"
import { UserStateContext } from "../providers/UserStateProvider"
import { Web3Provider } from "@ethersproject/providers"
import { Zero } from "@ethersproject/constants"
import { calculateBoost } from "../utils"

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

export default function useUserGauge(
  account?: string | null,
  chainId?: ChainId,
  library?: Web3Provider,
  gaugeAddress?: string,
): UserGauge | null {
  const [veSdlBalance, setVeSdlBalance] = useState(Zero)
  const [totalVeSdl, setTotalVeSdl] = useState(Zero)

  const { gauges } = useContext(GaugeContext)
  const { data: registryAddresses } = useContext(RegistryAddressContext)
  const tokens = useContext(TokensContext)
  const gauge = Object.values(gauges).find(
    ({ address }) => address === gaugeAddress,
  )
  console.log("gauge in use user gauge", gauge)
  const lpToken = tokens?.[gauge?.lpTokenAddress ?? ""]
  const userState = useContext(UserStateContext)
  useEffect(() => {
    const fetchVeSdlBalance = async () => {
      if (!account || !chainId || !library) {
        return
      }
      await retrieveAndSetSDLValues(
        account,
        chainId,
        library,
        setVeSdlBalance,
        setTotalVeSdl,
      )
    }

    void fetchVeSdlBalance()
  }, [account, chainId, library])

  if (
    !gauge ||
    !account ||
    !userState ||
    !library ||
    !chainId ||
    !lpToken ||
    !gaugeAddress
  )
    return null

  const gaugeContract = getGaugeContract(
    library,
    chainId,
    gauge?.address,
    account,
  )

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
      const promises = []
      if (hasExternalRewards) {
        promises.push(gaugeContract["claim_rewards(address)"](account))
      }

      if (chainId == ChainId.MAINNET || chainId == ChainId.HARDHAT) {
        const gaugeMinterContract = getGaugeMinterContract(
          chainId,
          account,
          library,
        )

        promises.push(gaugeMinterContract.mint(gaugeAddress))
      } else {
        if (registryAddresses["ChildGaugeFactory"]) {
          const childGaugeFactory = getChildGaugeFactory(
            account,
            library,
            registryAddresses["ChildGaugeFactory"],
          )
          promises.push(childGaugeFactory.mint(gaugeAddress))
        } else {
          console.error(
            "Unable to retrieve necessary ChildGaugeFactory contract address",
          )
        }
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

async function retrieveAndSetSDLValues(
  account: string,
  chainId: ChainId,
  library: Web3Provider,
  setVeSdlBalance: (value: SetStateAction<BigNumber>) => void,
  setTotalVeSdl: (value: SetStateAction<BigNumber>) => void,
): Promise<void> {
  if (chainId === ChainId.MAINNET || chainId === ChainId.HARDHAT) {
    const votingEscrowContract = getVotingEscrowContract(
      chainId,
      account,
      library,
    )
    setVeSdlBalance(await votingEscrowContract["balanceOf(address)"](account))
    const supply = await votingEscrowContract["totalSupply()"]()
    setTotalVeSdl(supply)
  } else {
    const childOracle = getChildOracle(chainId, account, library)
    const veSDLBalance = await childOracle["balanceOf(address)"](account)
    setVeSdlBalance(veSDLBalance)
    const supply = await childOracle["totalSupply()"]()
    setTotalVeSdl(supply)
  }
}
