import {
  BN_1E18,
  BN_MSIG_SDL_VEST_END_TIMESTAMP,
  ChainId,
  GAUGE_CONTROLLER_ADDRESSES,
  IS_VESDL_LIVE,
} from "../constants"
import { BigNumberish, CallOverrides } from "ethers/lib/ethers"
import {
  CHILD_GAUGE_FACTORY_NAME,
  getChildGaugeFactory,
  getGaugeControllerContract,
  getGaugeMinterContract,
} from "../hooks/useContract"
import {
  MulticallCall,
  MulticallContract,
  MulticallProvider,
} from "../types/ethcall"
import {
  createMultiCallContract,
  enumerate,
  getMulticallProvider,
} from "../utils"

import { BasicPools } from "./../providers/BasicPoolsProvider"
import { BasicToken } from "./../providers/TokensProvider"
import { BigNumber } from "@ethersproject/bignumber"
import CHILD_GAUGE_ABI from "../constants/abis/childGauge.json"
import CHILD_GAUGE_FACTORY_ABI from "../constants/abis/childGaugeFactory.json"
import { ChildGauge } from "../../types/ethers-contracts/ChildGauge"
import { ChildGaugeFactory } from "../../types/ethers-contracts/ChildGaugeFactory"
import GAUGE_CONTROLLER_ABI from "../constants/abis/gaugeController.json"
import { GaugeController } from "../../types/ethers-contracts/GaugeController"
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
  poolAddress: string | null | undefined
  poolName: string | null | undefined
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

export async function getGaugeDataMainnet(
  library: Web3Provider,
  chainId: ChainId,
  basicPools: BasicPools,
  registryAddresses: Partial<Record<string, string>>,
  account?: string,
) {
  if (!registryAddresses || !areGaugesActive(chainId)) return initialGaugesState
  try {
    const ethCallProvider = await getMulticallProvider(library, chainId)
    const gaugeController = getGaugeControllerContract(
      chainId,
      library,
      account,
    )

    const gaugeMinterContract = getGaugeMinterContract(
      chainId,
      library,
      account,
    )

    const gaugeCount: number = (await gaugeController.n_gauges()).toNumber()

    // mainnet contracts
    const gaugeControllerContractAddress = GAUGE_CONTROLLER_ADDRESSES[chainId]

    const gaugeControllerMultiCall = createMultiCallContract<GaugeController>(
      gaugeControllerContractAddress,
      GAUGE_CONTROLLER_ABI,
    )

    const gaugeAddresses: string[] = (
      await ethCallProvider.tryAll(
        enumerate(gaugeCount, 0).map((value) =>
          gaugeControllerMultiCall.gauges(value),
        ),
      )
    )
      .map((address) => address && address.toLowerCase())
      .filter(Boolean) as string[]

    const gaugeMulticallContracts = retrieveGaugeContracts(
      gaugeAddresses,
      chainId,
    )

    const gaugeWeightsPromise: Promise<(BigNumber | null)[]> =
      ethCallProvider.tryAll(
        gaugeAddresses.map((gaugeAddress) =>
          gaugeControllerMultiCall.get_gauge_weight(gaugeAddress),
        ),
      )

    const gaugeRelativeWeightsPromise: Promise<(BigNumber | null)[]> =
      ethCallProvider.tryAll(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        gaugeAddresses.map((gaugeAddress) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
          gaugeControllerMultiCall.gauge_relative_weight(gaugeAddress),
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
    const gaugeLpTokenAddressesPromise = ethCallProvider.tryAll(
      gaugeMulticallContracts.map((gaugeContract) => gaugeContract.lp_token()),
    )
    const gaugeNamesPromise = ethCallProvider.tryAll(
      gaugeMulticallContracts.map((gaugeContract) => gaugeContract.symbol()),
    )
    const gaugeKillStatusesPromise = ethCallProvider.tryAll(
      gaugeMulticallContracts.map((gaugeContract) => gaugeContract.is_killed()),
    )

    const gaugeRewardCounts = await getGaugeRewardCounts(
      gaugeMulticallContracts,
      ethCallProvider,
    )
    const [
      gaugeWeights,
      gaugeRelativeWeights,
      gaugeRewardTokens,
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
      getGaugeRewardTokens(
        gaugeMulticallContracts,
        gaugeRewardCounts,
        ethCallProvider,
      ),
      gaugeBalancePromise,
      gaugeWorkingBalancesPromise,
      gaugeWorkingSuppliesPromise,
      gaugeTotalSupplyPromise,
      gaugeLpTokenAddressesPromise,
      gaugeNamesPromise,
      gaugeKillStatusesPromise,
    ])

    const gaugeRewards = await getGaugeRewardsFromTokens(
      gaugeRewardCounts,
      gaugeMulticallContracts,
      gaugeRewardTokens,
      ethCallProvider,
    )

    const sdlRates = await getSDLRatesMainnet(
      gaugeMinterContract,
      gaugeRelativeWeights,
    )

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
        const pool = lpTokenToPool[lpTokenAddress || ""] as GaugePool
        const isValidPoolAddress = Boolean(
          pool?.poolAddress && !isAddressZero(pool?.poolAddress),
        )

        const poolAddress = isValidPoolAddress ? pool?.poolAddress : null
        const gaugeRelativeWeight = gaugeRelativeWeights[index]
        const sdlRate = sdlRates[index] || Zero
        const sdlReward = {
          periodFinish: BN_MSIG_SDL_VEST_END_TIMESTAMP,
          rate: sdlRate,
          tokenAddress: SDL_TOKEN_ADDRESSES[chainId].toLowerCase(),
          isMinter: true,
        }
        if (!lpTokenAddress) return previousGaugeData
        const gauge: Gauge = {
          address: gaugeAddress,
          gaugeWeight: gaugeWeights[index] || Zero,
          gaugeRelativeWeight: gaugeRelativeWeight || Zero,
          gaugeTotalSupply: gaugeTotalSupplies[index] || Zero,
          workingSupply: gaugeWorkingSupplies[index] || Zero,
          workingBalances: gaugeWorkingBalances?.[index] || Zero,
          gaugeBalance: gaugeBalances?.[index] || Zero,
          gaugeName: gaugeNames[index],
          lpTokenAddress,
          isKilled: gaugeKillStatuses[index] ?? false,
          poolAddress,
          poolName: pool?.poolName,
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
    return initialGaugesState
  }
}

export async function getGaugeDataSidechain(
  library: Web3Provider,
  chainId: ChainId,
  basicPools: BasicPools,
  registryAddresses: Partial<Record<string, string>>,
  account?: string,
) {
  const childGaugeFactoryAddress = registryAddresses[CHILD_GAUGE_FACTORY_NAME]

  if (
    !areGaugesActive(chainId) ||
    !registryAddresses ||
    !childGaugeFactoryAddress
  )
    return initialGaugesState

  try {
    const childGaugeFactory = getChildGaugeFactory(
      library,
      childGaugeFactoryAddress,
    )
    const gaugeCount: number = (
      await childGaugeFactory.get_gauge_count()
    ).toNumber()

    const ethCallProvider = await getMulticallProvider(library, chainId)
    const childGaugeFactoryMultiCall =
      createMultiCallContract<ChildGaugeFactory>(
        childGaugeFactoryAddress,
        CHILD_GAUGE_FACTORY_ABI,
      )

    const gaugeAddresses: string[] = (
      await ethCallProvider.tryAll(
        enumerate(gaugeCount, 0).map(
          retrieveGaugeAddressesSidechain(childGaugeFactoryMultiCall),
        ),
      )
    )
      .map((address) => address && address.toLowerCase())
      .filter(Boolean) as string[]

    const gaugeMulticallContracts = retrieveGaugeContracts(
      gaugeAddresses,
      chainId,
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
    const gaugeLpTokenAddressesPromise = ethCallProvider.tryAll(
      gaugeMulticallContracts.map((gaugeContract) => gaugeContract.lp_token()),
    )
    const gaugeNamesPromise = ethCallProvider.tryAll(
      gaugeMulticallContracts.map((gaugeContract) => gaugeContract.symbol()),
    )
    const gaugeKillStatusesPromise = ethCallProvider.tryAll(
      gaugeMulticallContracts.map((gaugeContract) => gaugeContract.is_killed()),
    )

    const gaugeRewardCounts = await getGaugeRewardCounts(
      gaugeMulticallContracts,
      ethCallProvider,
    )
    const [
      gaugeRewardTokens,
      gaugeBalances,
      gaugeWorkingBalances,
      gaugeWorkingSupplies,
      gaugeTotalSupplies,
      gaugeLpTokenAddresses,
      gaugeNames,
      gaugeKillStatuses,
    ] = await Promise.all([
      getGaugeRewardTokens(
        gaugeMulticallContracts,
        gaugeRewardCounts,
        ethCallProvider,
      ),
      gaugeBalancePromise,
      gaugeWorkingBalancesPromise,
      gaugeWorkingSuppliesPromise,
      gaugeTotalSupplyPromise,
      gaugeLpTokenAddressesPromise,
      gaugeNamesPromise,
      gaugeKillStatusesPromise,
    ])

    const gaugeRewards = await getGaugeRewardsFromTokens(
      gaugeRewardCounts,
      gaugeMulticallContracts,
      gaugeRewardTokens,
      ethCallProvider,
    )

    const sdlRates = await getSDLRatesSidechain(
      gaugeMulticallContracts as MulticallContract<ChildGauge>[],
      ethCallProvider,
    )

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
        const pool = lpTokenToPool[lpTokenAddress || ""] as GaugePool
        const isValidPoolAddress = Boolean(
          pool?.poolAddress && !isAddressZero(pool?.poolAddress),
        )

        const poolAddress = isValidPoolAddress ? pool?.poolAddress : null
        const sdlRate = sdlRates[index] || Zero
        const sdlReward = {
          periodFinish: BN_MSIG_SDL_VEST_END_TIMESTAMP,
          rate: sdlRate,
          tokenAddress: SDL_TOKEN_ADDRESSES[chainId].toLowerCase(),
          isMinter: true,
        }
        if (!lpTokenAddress) return previousGaugeData
        const gauge: Gauge = {
          address: gaugeAddress,
          gaugeWeight: Zero,
          gaugeRelativeWeight: Zero,
          gaugeTotalSupply: gaugeTotalSupplies[index] || Zero,
          workingSupply: gaugeWorkingSupplies[index] || Zero,
          workingBalances: gaugeWorkingBalances?.[index] || Zero,
          gaugeBalance: gaugeBalances?.[index] || Zero,
          gaugeName: gaugeNames[index],
          lpTokenAddress,
          isKilled: gaugeKillStatuses[index] ?? false,
          poolAddress,
          poolName: pool?.poolName,
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
    return initialGaugesState
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
  if (!gaugeAddresses.length || !ethCallProvider || !account) return null
  try {
    const gaugeMulticallContracts = retrieveGaugeContracts(
      gaugeAddresses,
      chainId,
    )
    const gaugeRewardCounts = await getGaugeRewardCounts(
      gaugeMulticallContracts,
      ethCallProvider,
    )

    // LiquidityV5 gauges divide rewards into SDL (#claimable_tokens) and non-SDL (#claimable_reward)

    const gaugeRewardTokens = await getGaugeRewardTokens(
      gaugeMulticallContracts,
      gaugeRewardCounts,
      ethCallProvider,
    )

    const gaugeUserClaimableExternalRewards =
      await getClaimableRewardsFromTokens(
        account,
        gaugeRewardCounts,
        gaugeMulticallContracts,
        gaugeRewardTokens,
        ethCallProvider,
      )

    const gaugeUserClaimableSDLPromise = ethCallProvider.all(
      gaugeMulticallContracts.map((gaugeContract) =>
        gaugeContract.claimable_tokens(account),
      ),
    )

    const gaugeUserDepositBalancesPromise = ethCallProvider.all(
      gaugeMulticallContracts.map((gaugeContract) =>
        gaugeContract.balanceOf(account),
      ),
    )
    const [gaugeUserClaimableSDL, gaugeUserDepositBalances] = await Promise.all(
      [gaugeUserClaimableSDLPromise, gaugeUserDepositBalancesPromise],
    )

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

function retrieveGaugeAddressesSidechain(
  childGaugeFactoryMultiCall: MulticallContract<ChildGaugeFactory>,
): (
  value: number,
  index: number,
  array: number[],
) => MulticallCall<
  [arg0: BigNumberish, overrides?: CallOverrides | undefined],
  string
> {
  return (value) => childGaugeFactoryMultiCall.get_gauge(value)
}

const retrieveGaugeContracts = (
  gaugeAddresses: string[],
  chainId: ChainId,
): MulticallContract<LiquidityGaugeV5>[] | MulticallContract<ChildGauge>[] => {
  if (chainId === ChainId.MAINNET) {
    return gaugeAddresses.map((address) =>
      createMultiCallContract<LiquidityGaugeV5>(
        address,
        LIQUIDITY_GAUGE_V5_ABI,
      ),
    )
  }

  return gaugeAddresses.map((address) =>
    createMultiCallContract<ChildGauge>(address, CHILD_GAUGE_ABI),
  )
}

async function getSDLRatesSidechain(
  gaugeMulticallContracts: MulticallContract<ChildGauge>[],
  ethCallProvider: MulticallProvider,
): Promise<(BigNumber | null)[]> {
  const currentTimeStamp = Math.floor(Date.now() / 1000 / 604800)
  return await ethCallProvider.tryAll(
    gaugeMulticallContracts.map((contract) =>
      contract.inflation_rate(Math.floor(currentTimeStamp)),
    ),
  )
}

async function getSDLRatesMainnet(
  gaugeMinterContract: Minter,
  gaugeRelativeWeights: (BigNumber | null)[],
): Promise<(BigNumber | null)[]> {
  const minterSDLRate = await gaugeMinterContract.rate()
  return gaugeRelativeWeights.map(
    (weight) => weight && minterSDLRate.mul(weight).div(BN_1E18),
  )
}

async function getGaugeRewardCounts(
  gaugeMulticallContracts:
    | MulticallContract<LiquidityGaugeV5>[]
    | MulticallContract<ChildGauge>[],
  ethCallProvider: MulticallProvider,
) {
  return (
    await ethCallProvider.tryAll(
      gaugeMulticallContracts.map((contract) => contract.reward_count()),
    )
  ).map((count) => count || Zero)
}

async function getGaugeRewardTokens(
  gaugeMulticallContracts: (
    | MulticallContract<ChildGauge>
    | MulticallContract<LiquidityGaugeV5>
  )[],
  gaugeRewardCounts: BigNumber[],
  ethCallProvider: MulticallProvider,
) {
  return Promise.all(
    gaugeRewardCounts.map((count, index) =>
      ethCallProvider.all(
        enumerate(count.toNumber(), 0).map((num) =>
          gaugeMulticallContracts[index].reward_tokens(num),
        ),
      ),
    ),
  )
}

async function getGaugeRewardsFromTokens(
  gaugeRewardCounts: BigNumber[],
  gaugeMulticallContracts: (
    | MulticallContract<ChildGauge>
    | MulticallContract<LiquidityGaugeV5>
  )[],
  gaugeRewardsTokens: string[][],
  ethCallProvider: MulticallProvider,
) {
  return Promise.all(
    gaugeRewardCounts.map((count, index) =>
      ethCallProvider.all(
        enumerate(count.toNumber(), 0).map(
          (num) =>
            gaugeMulticallContracts[index].reward_data(
              gaugeRewardsTokens[index][num],
            ) as unknown as MulticallCall<
              [arg0: string, overrides?: CallOverrides | undefined],
              [string, string, BigNumber, BigNumber, BigNumber, BigNumber] & {
                token: string
                distributor: string
                period_finish: BigNumber
                rate: BigNumber
                last_update: BigNumber
                integral: BigNumber
              }
            >,
        ),
      ),
    ),
  )
}

async function getClaimableRewardsFromTokens(
  account: string,
  gaugeRewardCounts: BigNumber[],
  gaugeMulticallContracts: (
    | MulticallContract<ChildGauge>
    | MulticallContract<LiquidityGaugeV5>
  )[],
  gaugeRewardsTokens: string[][],
  ethCallProvider: MulticallProvider,
) {
  return Promise.all(
    gaugeRewardCounts.map((count, index) =>
      ethCallProvider.all(
        enumerate(count.toNumber(), 0).map(
          (num) =>
            gaugeMulticallContracts[index].claimable_reward(
              account,
              gaugeRewardsTokens[index][num],
            ) as unknown as MulticallCall<
              [
                _user: string,
                _reward_token: string,
                overrides?: CallOverrides | undefined,
              ],
              BigNumber
            >,
        ),
      ),
    ),
  )
}
