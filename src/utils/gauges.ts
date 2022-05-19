import {
  ChainId,
  GAUGE_CONTROLLER_ADDRESSES,
  HELPER_CONTRACT_ADDRESSES,
} from "../constants"
import {
  createMultiCallContract,
  enumerate,
  getMulticallProvider,
} from "../utils"

import { BigNumber } from "ethers"
import GAUGE_CONTROLLER_ABI from "../constants/abis/gaugeController.json"
import { GaugeController } from "../../types/ethers-contracts/GaugeController"
import HELPER_CONTRACT_ABI from "../constants/abis/helperContract.json"
import { HelperContract } from "../../types/ethers-contracts/HelperContract"
import { Web3Provider } from "@ethersproject/providers"

export type Gauge = {
  address: string
  gaugeWeight: BigNumber
  poolAddress: string
  gaugeRelativeWeight: BigNumber
  workingSupply: BigNumber
  rewards: GaugeReward[]
}

export type GaugeReward = {
  period_finish: BigNumber
  last_update: BigNumber
  distributor: string
  rate: BigNumber
  token: string
}

export type PoolAddressToGauge = {
  [poolAddress: string]: Gauge | undefined
}

export type Gauges = {
  gaugeCount: number
  gauges: PoolAddressToGauge
}

export type GaugeRewardUserData = {
  [gaugeAddress: string]: BigNumber[]
}

export const initialGaugesState: Gauges = {
  gaugeCount: 0,
  gauges: {},
}

export async function getGaugeData(
  library: Web3Provider,
  chainId: ChainId,
  gaugeController: GaugeController,
): Promise<Gauges | null> {
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

    const gaugePoolAddresses: string[] = (
      await ethCallProvider.all(
        gaugeAddresses.map((address) =>
          helperContractMultiCall.gaugeToPoolAddress(address),
        ),
      )
    ).map((poolAddress) => poolAddress.toLowerCase())

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

    const [gaugeWeights, gaugeRelativeWeights, gaugeRewards] =
      await Promise.all([
        gaugeWeightsPromise,
        gaugeRelativeWeightsPromise,
        gaugeRewardsPromise,
      ])

    const gauges: PoolAddressToGauge = gaugePoolAddresses.reduce(
      (previousGaugeData, gaugePoolAddress, index) => {
        return {
          ...previousGaugeData,
          [gaugePoolAddress]: {
            address: gaugeAddresses[index],
            poolAddress: gaugePoolAddress,
            gaugeWeight: gaugeWeights[index],
            gaugeRelativeWeight: gaugeRelativeWeights[index],
            rewards: gaugeRewards[index].map((reward) => ({
              periodFinish: reward.period_finish,
              lastUpdate: reward.last_update,
              distributor: reward.distributor.toLowerCase(),
              rate: reward.rate,
              token: reward.token.toLowerCase(),
            })),
          },
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
    const gaugeUserRewardsCalls = gaugeAddresses.map((gaugeAddress) =>
      helperContractMultiCall.getClaimableRewards(gaugeAddress, account),
    )
    const gaugeUserRewards = await ethCallProvider.all(gaugeUserRewardsCalls)
    return gaugeUserRewards.reduce((acc, gaugeUserReward, index) => {
      // don't include 0 rewards
      if (!gaugeUserReward.some((reward) => reward.gt(0))) {
        return acc
      }
      return {
        ...acc,
        [gaugeAddresses[index]]: gaugeUserReward,
      }
    }, {})
  } catch (e) {
    const error = e as Error
    error.message = `Failed to get user gauge data; ${error.message}`
    console.error(error)
    return null
  }
}
