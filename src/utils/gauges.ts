import {
  BN_1E18,
  BN_MSIG_SDL_VEST_END_TIMESTAMP,
  ChainId,
  GAUGE_CONTROLLER_ADDRESSES,
  HELPER_CONTRACT_ADDRESSES,
  IS_VESDL_LIVE,
} from "../constants"
import {
  createMultiCallContract,
  enumerate,
  getMulticallProvider,
} from "../utils"

import { BigNumber } from "@ethersproject/bignumber"
import GAUGE_CONTROLLER_ABI from "../constants/abis/gaugeController.json"
import { GaugeController } from "../../types/ethers-contracts/GaugeController"
import HELPER_CONTRACT_ABI from "../constants/abis/helperContract.json"
import { HelperContract } from "../../types/ethers-contracts/HelperContract"
import LIQUIDITY_GAUGE_V5_ABI from "../constants/abis/liquidityGaugeV5.json"
import { LiquidityGaugeV5 } from "../../types/ethers-contracts/LiquidityGaugeV5"
import { Minter } from "../../types/ethers-contracts/Minter"
import { SDL_TOKEN_ADDRESSES } from "./../constants/index"
import { Web3Provider } from "@ethersproject/providers"
import { Zero } from "@ethersproject/constants"
import { isAddressZero } from "."

export type Gauge = {
  address: string
  gaugeBalance: BigNumber | null
  gaugeTotalSupply: BigNumber | null
  gaugeWeight: BigNumber
  poolAddress: string | null
  poolName: string
  gaugeRelativeWeight: BigNumber
  workingBalances: BigNumber | null
  workingSupply: BigNumber | null
  rewards: GaugeReward[]
  gaugeName: string | null
}

export type GaugeReward = {
  periodFinish: BigNumber
  rate: BigNumber
  tokenAddress: string
}

export type LPTokenAddressToGauge = Partial<{
  [lpTokenAddress: string]: Gauge
}>

export type Gauges = {
  gaugeCount: number
  gauges: LPTokenAddressToGauge
}

export type GaugeRewardUserData = Partial<{
  [gaugeAddress: string]: {
    amountStaked: BigNumber
    claimableExternalRewards: { amount: BigNumber; tokenAddress: string }[]
    claimableSDL: BigNumber
  }
}>

export const initialGaugesState: Gauges = {
  gaugeCount: 0,
  gauges: {},
}

export async function getGaugeData(
  library: Web3Provider,
  chainId: ChainId,
  gaugeController: GaugeController,
  account: string,
  minterContract: Minter,
): Promise<Gauges | null> {
  // TODO switch to IS_VESDL_LIVE
  if (chainId !== ChainId.HARDHAT) return initialGaugesState
  try {
    const gaugeCount = (await gaugeController.n_gauges()).toNumber()
    const ethCallProvider = await getMulticallProvider(library, chainId)
    const helperContractAddress = HELPER_CONTRACT_ADDRESSES[chainId]
    const gaugeControllerContractAddress = GAUGE_CONTROLLER_ADDRESSES[chainId]

    const helperContractMultiCall = createMultiCallContract<HelperContract>(
      helperContractAddress,
      HELPER_CONTRACT_ABI,
    )

    const gaugeControllerMultiCall = createMultiCallContract<GaugeController>(
      gaugeControllerContractAddress,
      GAUGE_CONTROLLER_ABI,
    )

    const gaugeAddresses: string[] = (
      await ethCallProvider.all(
        enumerate(gaugeCount, 0).map((value) =>
          gaugeControllerMultiCall.gauges(value),
        ),
      )
    ).map((address) => address.toLowerCase())

    const gaugePoolAddresses = (
      await ethCallProvider.tryAll(
        gaugeAddresses.map((address) =>
          helperContractMultiCall.gaugeToPoolAddress(address),
        ),
      )
    ).map((poolAddress) => poolAddress?.toLowerCase())

    const gaugeRewardsPromise = ethCallProvider.all(
      gaugeAddresses.map((address) =>
        helperContractMultiCall.getGaugeRewards(address),
      ),
    )
    const gaugeWeightsPromise: Promise<BigNumber[]> = ethCallProvider.all(
      gaugeAddresses.map((gaugeAddress) =>
        gaugeControllerMultiCall.get_gauge_weight(gaugeAddress),
      ),
    )
    const gaugeRelativeWeightsPromise: Promise<BigNumber[]> =
      ethCallProvider.all(
        gaugeAddresses.map((gaugeAddress) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
          gaugeControllerMultiCall.gauge_relative_weight(gaugeAddress),
        ),
      )

    const gaugeMulticallContracts = gaugeAddresses.map((gaugeAddress) =>
      createMultiCallContract<LiquidityGaugeV5>(
        gaugeAddress,
        LIQUIDITY_GAUGE_V5_ABI,
      ),
    )
    const gaugeBalancePromise = ethCallProvider.tryAll(
      gaugeMulticallContracts.map((gaugeContract) =>
        gaugeContract.balanceOf(account),
      ),
    )
    const gaugeTotalSupplyPromise = ethCallProvider.tryAll(
      gaugeMulticallContracts.map((gaugeContract) =>
        gaugeContract.totalSupply(),
      ),
    )
    const gaugeWorkingSuppliesPromise = ethCallProvider.tryAll(
      gaugeMulticallContracts.map((gaugeContract) =>
        gaugeContract.working_supply(),
      ),
    )
    const gaugeWorkingBalancesPromise = ethCallProvider.tryAll(
      gaugeMulticallContracts.map((gaugeContract) =>
        gaugeContract.working_balances(account),
      ),
    )
    const gaugeLpTokenAddressesPromise = ethCallProvider.tryAll(
      gaugeMulticallContracts.map((gaugeContract) => gaugeContract.lp_token()),
    )
    const gaugeNamesPromise = ethCallProvider.tryAll(
      gaugeMulticallContracts.map((gaugeContract) => gaugeContract.name()),
    )
    const [
      gaugeWeights,
      gaugeRelativeWeights,
      gaugeRewards,
      gaugeBalances,
      gaugeWorkingSupplies,
      gaugeWorkingBalances,
      gaugeTotalSupplies,
      gaugeLpTokenAddresses,
      gaugeNames,
      minterSDLRate,
    ] = await Promise.all([
      gaugeWeightsPromise,
      gaugeRelativeWeightsPromise,
      gaugeRewardsPromise,
      gaugeBalancePromise,
      gaugeWorkingBalancesPromise,
      gaugeTotalSupplyPromise,
      gaugeWorkingSuppliesPromise,
      gaugeLpTokenAddressesPromise,
      gaugeNamesPromise,
      minterContract ? minterContract.rate() : Promise.resolve(Zero),
    ])

    const gauges: LPTokenAddressToGauge = gaugeAddresses.reduce(
      (previousGaugeData, gaugeAddress, index) => {
        const lpTokenAddress = gaugeLpTokenAddresses[index]?.toLowerCase()
        const poolAddress = gaugePoolAddresses[index]
        const gaugeRelativeWeight = gaugeRelativeWeights[index]
        const sdlRate = minterSDLRate.mul(gaugeRelativeWeight).div(BN_1E18) // @dev see "Math" section of readme
        const sdlReward = {
          periodFinish: BN_MSIG_SDL_VEST_END_TIMESTAMP,
          rate: sdlRate,
          tokenAddress: SDL_TOKEN_ADDRESSES[chainId].toLowerCase(),
        }
        if (!lpTokenAddress) return previousGaugeData
        return {
          ...previousGaugeData,
          [lpTokenAddress]: {
            address: gaugeAddress,
            gaugeWeight: gaugeWeights[index],
            gaugeRelativeWeight: gaugeRelativeWeights[index],
            gaugeTotalSupply: gaugeTotalSupplies[index],
            workingSupply: gaugeWorkingSupplies[index],
            workingBalances: gaugeWorkingBalances[index],
            gaugeBalance: gaugeBalances[index],
            gaugeName: gaugeNames[index],
            poolAddress:
              !poolAddress || isAddressZero(poolAddress) ? null : poolAddress,
            poolName: "",
            rewards: gaugeRewards[index]
              .map((reward) => ({
                periodFinish: reward.period_finish,
                rate: reward.rate,
                tokenAddress: reward.token.toLowerCase(),
              }))
              .concat([sdlReward]),
          } as Gauge,
        }
      },
      {},
    )

    return {
      gaugeCount,
      gauges,
    }
  } catch (e) {
    const error = new Error(
      `Unable to get Gauge data \n${(e as Error).message}`,
    )
    error.stack = (e as Error).stack
    console.error(error)
    return null
  }
}

export async function getGaugeRewardsUserData(
  library: Web3Provider,
  chainId: ChainId,
  gaugeAddresses: string[],
  rewardsAddresses: string[][],
  account?: string,
): Promise<GaugeRewardUserData | null> {
  const ethCallProvider = await getMulticallProvider(library, chainId)
  const helperContractAddress = HELPER_CONTRACT_ADDRESSES[chainId]

  const helperContractMultiCall = createMultiCallContract<HelperContract>(
    helperContractAddress,
    HELPER_CONTRACT_ABI,
  )
  if (
    !gaugeAddresses.length ||
    !helperContractAddress ||
    !ethCallProvider ||
    !account
  )
    return null
  try {
    const gaugeMulticallContracts = gaugeAddresses.map((gaugeAddress) =>
      createMultiCallContract<LiquidityGaugeV5>(
        gaugeAddress,
        LIQUIDITY_GAUGE_V5_ABI,
      ),
    )
    // LiquidityV5 gauges divide rewards into SDL (#claimable_tokens) and non-SDL (#claimable_reward)
    const gaugeUserClaimableSDLPromise = ethCallProvider.all(
      gaugeMulticallContracts.map((gaugeContract) =>
        gaugeContract.claimable_tokens(account),
      ),
    )
    const gaugeUserClaimableExternalRewardsPromise = ethCallProvider.all(
      gaugeAddresses.map((gaugeAddress) =>
        helperContractMultiCall.getClaimableRewards(gaugeAddress, account),
      ),
    )
    const gaugeUserDepositBalancesPromise = ethCallProvider.all(
      gaugeMulticallContracts.map((gaugeContract) =>
        gaugeContract.balanceOf(account),
      ),
    )
    const [
      gaugeUserClaimableSDL,
      gaugeUserClaimableExternalRewards,
      gaugeUserDepositBalances,
    ] = await Promise.all([
      gaugeUserClaimableSDLPromise,
      gaugeUserClaimableExternalRewardsPromise,
      gaugeUserDepositBalancesPromise,
    ])

    return gaugeAddresses.reduce((acc, gaugeAddress, i) => {
      const amountStaked = gaugeUserDepositBalances[i]
      // @dev: reward amounts ([1,2,3]) are returned in the same order as gauge.rewards ([0xa,0xb,0xc])
      // however SDL rewards are appended to the end of that by the frontend
      const claimableExternalRewards = gaugeUserClaimableExternalRewards[i].map(
        (amount, j) => {
          const tokenAddress = rewardsAddresses[i][j]
          return { amount, tokenAddress }
        },
      )
      const claimableSDL = gaugeUserClaimableSDL[i]

      const hasSDLRewards = claimableSDL.gt(Zero)
      const hasDeposit = amountStaked.gt(Zero)
      const hasExternalRewards =
        claimableExternalRewards.length > 0 &&
        claimableExternalRewards.some(({ amount }) => amount.gt(Zero))

      if (!hasExternalRewards && !hasSDLRewards && !hasDeposit) return acc // don't include 0 rewards

      return {
        ...acc,
        [gaugeAddress]: {
          amountStaked,
          claimableExternalRewards,
          claimableSDL,
        },
      }
    }, {})
  } catch (e) {
    const error = e as Error
    error.message = `Failed to get user gauge data; ${error.message}`
    console.error(error)
    return null
  }
}

export function areGaugesActive(chainId?: ChainId): boolean {
  return (
    (chainId === ChainId.MAINNET || chainId === ChainId.HARDHAT) &&
    IS_VESDL_LIVE
  )
}
