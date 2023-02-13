import { BasicToken, TokensContext } from "../providers/TokensProvider"
import {
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import {
  getChildGaugeFactory,
  getChildOracle,
  getGaugeContract,
  getGaugeMinterContract,
  getVotingEscrowContract,
  isMainnet,
} from "./useContract"

import { BigNumber } from "@ethersproject/bignumber"
import { ChainId } from "../constants/networks"
import { ContractTransaction } from "ethers"
import { GaugeContext } from "../providers/GaugeProvider"
import { GaugeUserReward } from "../utils/gauges"
import { LiquidityGaugeV5 } from "../../types/ethers-contracts/LiquidityGaugeV5"
import { UserStateContext } from "../providers/UserStateProvider"
import { Web3Provider } from "@ethersproject/providers"
import { Zero } from "@ethersproject/constants"
import { calculateBoost } from "../utils"
import { enqueueToast } from "../components/Toastify"
import { useActiveWeb3React } from "."
import { useRegistryAddress } from "./useRegistryAddress"

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

export default function useUserGauge(): (
  gaugeAddress?: string,
) => UserGauge | null {
  const { account, library, chainId } = useActiveWeb3React()
  const { data: registryAddresses } = useRegistryAddress()

  const { gauges } = useContext(GaugeContext)
  const userState = useContext(UserStateContext)
  const tokens = useContext(TokensContext)

  const [veSdlBalance, setVeSdlBalance] = useState(Zero)
  const [totalVeSdl, setTotalVeSdl] = useState(Zero)

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

  return useCallback(
    (gaugeAddress?: string) => {
      const gauge = Object.values(gauges).find(
        ({ address }) => address === gaugeAddress,
      )
      const lpToken = tokens?.[gauge?.lpTokenAddress ?? ""]
      if (
        !account ||
        !chainId ||
        !gauge ||
        !gaugeAddress ||
        !library ||
        !lpToken ||
        !registryAddresses ||
        !userState
      ) {
        return null
      }

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
        claim: async () => {
          const promises = []
          try {
            if (hasExternalRewards) {
              promises.push(gaugeContract["claim_rewards(address)"](account))
            }

            if (isMainnet(chainId)) {
              const gaugeMinterContract = getGaugeMinterContract(
                library,
                chainId,
                account,
              )

              promises.push(gaugeMinterContract.mint(gaugeAddress))
            } else {
              const childGaugeFactory = getChildGaugeFactory(
                library,
                chainId,
                registryAddresses["ChildGaugeFactory"],
                account,
              )
              promises.push(childGaugeFactory.mint(gaugeAddress))
            }
          } catch (e) {
            console.error(e)
            enqueueToast("error", "Unable to claim reward")
          }

          return await Promise.all(promises)
        },
        hasClaimableRewards: hasSDLRewards || hasExternalRewards,
        lpToken,
        userWalletLpTokenBalance:
          userState.tokenBalances?.[lpToken.address] || Zero,
        userStakedLpTokenBalance: userGaugeRewards?.amountStaked || Zero,
        userGaugeRewards: userGaugeRewards || null,
        boost,
      }
    },
    [
      account,
      chainId,
      gauges,
      library,
      registryAddresses,
      userState,
      tokens,
      veSdlBalance,
      totalVeSdl,
    ],
  )
}

export async function retrieveAndSetSDLValues(
  account: string,
  chainId: ChainId,
  library: Web3Provider,
  setVeSdlBalance: (value: SetStateAction<BigNumber>) => void,
  setTotalVeSdl: (value: SetStateAction<BigNumber>) => void,
): Promise<void> {
  const votingEscrowOrChildOracleContract = isMainnet(chainId)
    ? getVotingEscrowContract(library, chainId, account)
    : getChildOracle(library, chainId, account) // todo move to userstateprovider

  const [veSDLBalance, veSDLSupply] = await Promise.all([
    votingEscrowOrChildOracleContract["balanceOf(address)"](account),
    votingEscrowOrChildOracleContract["totalSupply()"](),
  ])

  setVeSdlBalance(veSDLBalance)
  setTotalVeSdl(veSDLSupply)
}
