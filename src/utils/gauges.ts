import {
  BN_1E18,
  BN_MSIG_SDL_VEST_END_TIMESTAMP,
  ChainId,
  GAUGE_CONTROLLER_ADDRESSES,
  GAUGE_HELPER_CONTRACT_ADDRESSES,
  IS_VESDL_LIVE,
} from "../constants"
import {
  createMultiCallContract,
  enumerate,
  getMulticallProvider,
} from "../utils"

import { BasicPools } from "./../providers/BasicPoolsProvider"
import { BasicToken } from "./../providers/TokensProvider"
import { BigNumber } from "@ethersproject/bignumber"
import { ChildGaugeFactory } from "../../types/ethers-contracts/ChildGaugeFactory"
import GAUGE_CONTROLLER_ABI from "../constants/abis/gaugeController.json"
import GAUGE_HELPER_CONTRACT_ABI from "../constants/abis/gaugeHelperContract.json"
import { GaugeController } from "../../types/ethers-contracts/GaugeController"
import { GaugeHelperContract } from "../../types/ethers-contracts/GaugeHelperContract"
import LIQUIDITY_GAUGE_V5_ABI from "../constants/abis/liquidityGaugeV5.json"
import { LiquidityGaugeV5 } from "../../types/ethers-contracts/LiquidityGaugeV5"
import { Minter } from "../../types/ethers-contracts/Minter"
import { SDL_TOKEN_ADDRESSES } from "./../constants/index"
import { Web3Provider } from "@ethersproject/providers"
import { Zero } from "@ethersproject/constants"
import { isAddressZero } from "."

export type Gauge = BaseGauge & GaugeWeight

export type GaugeWeight = {
  gaugeRelativeWeight: BigNumber
  gaugeWeight: BigNumber
}

export type BaseGauge = {
  address: string
  gaugeBalance: BigNumber
  gaugeTotalSupply: BigNumber
  lpTokenAddress: string
<<<<<<< HEAD
  poolAddress: string | null | undefined
  poolName: string | null | undefined
  gaugeRelativeWeight: BigNumber
=======
  poolAddress: string | null
  poolName: string | null
>>>>>>> 03a929a (WIP removed gaugeHelperContract to get pooladdress)
  workingBalances: BigNumber
  workingSupply: BigNumber
  rewards: GaugeReward[]
  gaugeName: string | null | undefined
  isKilled: boolean
}

export type GaugeReward = {
  periodFinish: BigNumber
  rate: BigNumber
  tokenAddress: string
  isMinter: boolean
}

export type LPTokenAddressToGauge = Partial<{
  [lpTokenAddress: string]: Gauge
}>

export type Gauges = {
  gaugeCount: number
  gauges: LPTokenAddressToGauge
}

export type GaugeUserReward = {
  amountStaked: BigNumber
  claimableExternalRewards: { amount: BigNumber; token: BasicToken }[]
  claimableSDL: BigNumber
}

export type GaugeRewardUserData = Partial<{
  [gaugeAddress: string]: GaugeUserReward
}>

export type GaugePool = {
  poolName: string
  poolAddress: string
}

export const initialGaugesState: Gauges = {
  gaugeCount: 0,
  gauges: {},
}

export async function getGaugeData(
  library: Web3Provider,
  chainId: ChainId,
  basicPools: BasicPools,
  gaugeController: GaugeController | null,
  childGaugeFactory: ChildGaugeFactory | null,
  gaugeMinterContract: Minter | null,
  account?: string,
): Promise<Gauges | null> {
  if (!childGaugeFactory || (!gaugeController && !gaugeMinterContract))
    return null
  if (!areGaugesActive(chainId)) return initialGaugesState
  try {
    const gaugeCount: number = (
      await getGaugeCount(childGaugeFactory, gaugeController)
    ).toNumber()
    const ethCallProvider = await getMulticallProvider(library, chainId)
    const gaugeHelperContractAddress = GAUGE_HELPER_CONTRACT_ADDRESSES[chainId]
    const gaugeControllerContractAddress = GAUGE_CONTROLLER_ADDRESSES[chainId]

    const gaugeHelperContractMultiCall =
      createMultiCallContract<GaugeHelperContract>(
        gaugeHelperContractAddress,
        GAUGE_HELPER_CONTRACT_ABI,
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

<<<<<<< HEAD
<<<<<<< HEAD
=======
    const sideChainGaugeAddresses: string[] = (
      await ethCallProvider.all(
        enumerate(sideChainGaugeCount, 0).map((index) =>
          rootGaugeFactoryMultiCall.get_gauge(ChainId.TEST_SIDE_CHAIN, index),
        ),
      )
    ).map((gaugeAddress) => gaugeAddress?.toLowerCase())

    const sideChainRelativeWeight = await gaugeController["gauge_relative_weight(address)"](sideChainGaugeAddresses[0])

    console.log({ sideChainRelativeWeight })

    const gaugePoolAddresses = (
      await ethCallProvider.tryAll(
        gaugeAddresses.map((address) =>
          gaugeHelperContractMultiCall.gaugeToPoolAddress(address),
        ),
      )
    ).map((poolAddress) => poolAddress?.toLowerCase())

>>>>>>> 24305ea (WIP)
=======
>>>>>>> 03a929a (WIP removed gaugeHelperContract to get pooladdress)
    const gaugeRewardsPromise = ethCallProvider.all(
      gaugeAddresses.map((address) =>
        gaugeHelperContractMultiCall.getGaugeRewards(address),
      ),
    )
    const gaugeWeightsPromise: Promise<BigNumber[]> = ethCallProvider.all(
      gaugeAddresses.map((gaugeAddress) =>
        gaugeControllerMultiCall.get_gauge_weight(gaugeAddress),
      ),
    )
    const gaugeRelativeWeightsPromise: Promise<BigNumber[]> =
      ethCallProvider.all(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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

    const gaugeBalancePromise = account
      ? ethCallProvider.tryAll(
          gaugeMulticallContracts.map((gaugeContract) =>
            gaugeContract.balanceOf(account),
          ),
        )
      : null
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
    const gaugeWorkingBalancesPromise = account
      ? ethCallProvider.tryAll(
          gaugeMulticallContracts.map((gaugeContract) =>
            gaugeContract.working_balances(account),
          ),
        )
      : null
    const gaugeLpTokenAddressesPromise = ethCallProvider.all(
      gaugeMulticallContracts.map((gaugeContract) => gaugeContract.lp_token()),
    )
    const gaugeNamesPromise = ethCallProvider.tryAll(
      gaugeMulticallContracts.map((gaugeContract) => gaugeContract.symbol()),
    )
    const gaugeKillStatusesPromise = ethCallProvider.tryAll(
      gaugeMulticallContracts.map((gaugeContract) => gaugeContract.is_killed()),
    )

    const [
      gaugeWeights,
      gaugeRelativeWeights,
      gaugeRewards,
      gaugeBalances,
      gaugeWorkingBalances,
      gaugeWorkingSupplies,
      gaugeTotalSupplies,
      gaugeLpTokenAddresses,
      gaugeNames,
      gaugeKillStatuses,
    ] = await Promise.all([
      gaugeWeightsPromise,
      gaugeRelativeWeightsPromise,
      gaugeRewardsPromise,
      gaugeBalancePromise,
      gaugeWorkingBalancesPromise,
      gaugeWorkingSuppliesPromise,
      gaugeTotalSupplyPromise,
      gaugeLpTokenAddressesPromise,
      gaugeNamesPromise,
      gaugeKillStatusesPromise,
    ])

    const minterSDLRate = await (gaugeMinterContract
      ? gaugeMinterContract.rate()
      : Promise.resolve(Zero))

    const lpTokenToPool: Partial<{
      [lpToken: string]: GaugePool
    }> = Object.values(basicPools || {}).reduce(
      (prevData, { lpToken, poolAddress, poolName }) => {
        return {
          ...prevData,
          [lpToken]: { poolAddress, poolName },
        }
      },
      {},
    )

    const gauges: LPTokenAddressToGauge = gaugeAddresses.reduce(
      (previousGaugeData, gaugeAddress, index) => {
        const lpTokenAddress = gaugeLpTokenAddresses[index]?.toLowerCase()
<<<<<<< HEAD
        const pool = lpTokenToPool[lpTokenAddress] as GaugePool
        const isValidPoolAddress = Boolean(
          pool?.poolAddress && !isAddressZero(pool?.poolAddress),
=======
        const pool = lpTokenToPool[lpTokenAddress] as {
          poolName: string
          poolAddress: string
        }
        const isValidPoolAddress = Boolean(
          pool && pool.poolAddress && !isAddressZero(pool.poolAddress),
>>>>>>> 03a929a (WIP removed gaugeHelperContract to get pooladdress)
        )
        const poolAddress = isValidPoolAddress ? pool?.poolAddress : null
        const gaugeRelativeWeight = gaugeRelativeWeights[index]
        const sdlRate = minterSDLRate.mul(gaugeRelativeWeight).div(BN_1E18) // @dev see "Math" section of readme
        const sdlReward = {
          periodFinish: BN_MSIG_SDL_VEST_END_TIMESTAMP,
          rate: sdlRate,
          tokenAddress: SDL_TOKEN_ADDRESSES[chainId].toLowerCase(),
          isMinter: true,
        }
        if (!lpTokenAddress) return previousGaugeData
        const gauge: Gauge = {
          address: gaugeAddress,
          gaugeWeight: gaugeWeights[index],
          gaugeRelativeWeight: gaugeRelativeWeight,
          gaugeTotalSupply: gaugeTotalSupplies[index] || Zero,
          workingSupply: gaugeWorkingSupplies[index] || Zero,
          workingBalances: gaugeWorkingBalances?.[index] || Zero,
          gaugeBalance: gaugeBalances?.[index] || Zero,
          gaugeName: gaugeNames[index],
          lpTokenAddress,
          isKilled: gaugeKillStatuses[index] ?? false,
<<<<<<< HEAD
          poolAddress,
          poolName: pool?.poolName,
=======
          poolAddress:
            isValidPoolAddress && pool?.poolAddress != null
              ? pool?.poolAddress
              : null,
          poolName: pool?.poolName || null,
>>>>>>> 03a929a (WIP removed gaugeHelperContract to get pooladdress)
          rewards: gaugeRewards[index]
            .map((reward) => ({
              periodFinish: reward.period_finish,
              rate: reward.rate,
              tokenAddress: reward.token.toLowerCase(),
              isMinter: false,
            }))
            .concat(sdlRate.gt(Zero) ? [sdlReward] : []),
        }
        return {
          ...previousGaugeData,
          [lpTokenAddress]: gauge,
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
  rewardsTokens: (BasicToken | undefined)[][],
  account?: string,
): Promise<GaugeRewardUserData | null> {
  const ethCallProvider = await getMulticallProvider(library, chainId)
  const gaugeHelperContractAddress = GAUGE_HELPER_CONTRACT_ADDRESSES[chainId]

  const gaugeHelperContractMultiCall =
    createMultiCallContract<GaugeHelperContract>(
      gaugeHelperContractAddress,
      GAUGE_HELPER_CONTRACT_ABI,
    )
  if (
    !gaugeAddresses.length ||
    !gaugeHelperContractAddress ||
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
        gaugeHelperContractMultiCall.getClaimableRewards(gaugeAddress, account),
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
      const claimableExternalRewards = gaugeUserClaimableExternalRewards[i]
        .map((amount, j) => {
          const token = rewardsTokens[i][j]
          return { amount, token }
        })
        .filter(({ token }) => !!token)
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

async function getGaugeCount(
  childGaugeFactory: ChildGaugeFactory | null,
  gaugeController: GaugeController | null,
): Promise<BigNumber> {
  if (childGaugeFactory) {
    return await childGaugeFactory.get_gauge_count()
  }

  if (gaugeController) {
    return await gaugeController.n_gauges()
  }

  return Promise.resolve(Zero)
}
