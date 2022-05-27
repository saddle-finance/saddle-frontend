import { AddressZero, Zero } from "@ethersproject/constants"
import {
  ChainId,
  MINICHEF_CONTRACT_ADDRESSES,
  getMinichefPid,
} from "../constants"
import { createMultiCallContract, getMulticallProvider } from "."

import { BigNumber } from "@ethersproject/bignumber"
import { Contract as EthcallContract } from "ethcall"
import { IRewarder } from "../../types/ethers-contracts/IRewarder"
import IRewarder_ABI from "../constants/abis/IRewarder.json"
import MINICHEF_CONTRACT_ABI from "../constants/abis/miniChef.json"
import { MiniChef } from "../../types/ethers-contracts/MiniChef"
import { MulticallContract } from "../types/ethcall"
import { Web3Provider } from "@ethersproject/providers"

export type MinichefPoolData = {
  sdlPerDay: BigNumber
  pid: number
  rewards?: Rewards
}
export type MinichefData = {
  allRewardTokens: string[]
  pools: {
    [poolAddress: string]: MinichefPoolData
  }
}
export type MinichefUserData = {
  [pid: number]: {
    amountStaked: BigNumber
    pendingSDL: BigNumber
    pendingExternal: BigNumber
  }
} | null
export type Rewards = {
  rewarderAddress: string
  rewardPerSecond: BigNumber
  rewardPerDay: BigNumber
  rewardTokenAddress: string
}
export type MinichefRewardersData = {
  [pid: number]: Rewards
}
const oneDaySecs = BigNumber.from(24 * 60 * 60)

/**
 * Returns sdlPerDay and pid from minichef for the given pool addresses.
 */
export async function getMinichefRewardsPoolsData(
  library: Web3Provider,
  chainId: ChainId,
  poolAddresses: string[],
): Promise<MinichefData | null> {
  const ethCallProvider = await getMulticallProvider(library, chainId)
  const minichefAddress = MINICHEF_CONTRACT_ADDRESSES[chainId]
  const addressesPidTuples = getPidsForPools(chainId, poolAddresses)
  if (!addressesPidTuples.length || !minichefAddress || !ethCallProvider)
    return null
  try {
    const minichefContract = new EthcallContract(
      minichefAddress,
      MINICHEF_CONTRACT_ABI,
    ) as MulticallContract<MiniChef>

    // Fetch SDL distribution amounts
    const [saddlePerSecond, totalAllocPoint, sdlAddress] =
      await ethCallProvider.tryEach(
        [
          minichefContract.saddlePerSecond(),
          minichefContract.totalAllocPoint(),
          minichefContract.SADDLE(),
        ],
        [false, false, false],
      )

    // Fetch SDL reward info for each pool
    const poolInfos = await ethCallProvider.tryEach(
      addressesPidTuples.map(([, pid]) => minichefContract.poolInfo(pid)),
      Array(addressesPidTuples.length).fill(true),
    )

    // Fetch Rewarder Data
    const rewardersData = await getMinichefRewardsRewardersData(
      library,
      chainId,
      poolAddresses,
    )

    // Aggregate Data
    const poolsData = addressesPidTuples.reduce((acc, [address, pid], i) => {
      const poolInfo = poolInfos[i]
      const rewardsData = rewardersData?.[pid]
      if (poolInfo) {
        const sdlPerDay = saddlePerSecond
          .mul(oneDaySecs)
          .mul(poolInfo.allocPoint)
          .div(totalAllocPoint)
        return {
          [address]: { sdlPerDay, pid, ...({ rewards: rewardsData } || {}) },
          ...acc,
        }
      }
      return acc
    }, {} as { [address: string]: MinichefPoolData })
    const allRewardTokens = [
      sdlAddress.toLowerCase(),
      ...Object.values(poolsData)
        .map((pool) => pool.rewards?.rewardTokenAddress.toLowerCase())
        .filter(Boolean),
    ] as string[]

    return {
      pools: poolsData,
      allRewardTokens,
    }
  } catch (e) {
    const error = e as Error
    error.message = `Failed to get pools minichef data; ${error.message}`
    console.error(error)
    return null
  }
}

function getPidsForPools(
  chainId: ChainId,
  poolAddresses: string[],
): [string, number][] {
  return poolAddresses
    .map((poolAddress) => [poolAddress, getMinichefPid(chainId, poolAddress)])
    .filter(([, pid]) => !!pid) as [string, number][]
}

export async function getMinichefRewardsRewardersData(
  library: Web3Provider,
  chainId: ChainId,
  poolAddresses: string[],
): Promise<MinichefRewardersData | null> {
  const ethCallProvider = await getMulticallProvider(library, chainId)
  const minichefAddress = MINICHEF_CONTRACT_ADDRESSES[chainId]
  const addressesPidTuples = getPidsForPools(chainId, poolAddresses)
  if (!addressesPidTuples.length || !minichefAddress || !ethCallProvider)
    return null
  try {
    const minichefContract = createMultiCallContract<MiniChef>(
      minichefAddress,
      MINICHEF_CONTRACT_ABI,
    )
    // Fetch Rewarder Data
    const rewarderAddresses = await ethCallProvider.tryEach(
      addressesPidTuples.map(([, pid]) => minichefContract.rewarder(pid)),
      Array(addressesPidTuples.length).fill(true),
    )
    const rewarderContractsMap = {} as {
      [pid: number]: MulticallContract<IRewarder>
    }
    rewarderAddresses.forEach((address, i) => {
      if (address && address !== AddressZero) {
        const pid = addressesPidTuples[i][1]
        rewarderContractsMap[pid] = createMultiCallContract<IRewarder>(
          address,
          IRewarder_ABI,
        )
      }
    })
    const rewarderPids = Object.keys(rewarderContractsMap)
    const rewarderTokensPromise = ethCallProvider.tryEach(
      rewarderPids.map((pid) => rewarderContractsMap[pid].rewardToken()),
      Array(rewarderPids.length).fill(true),
    )
    const rewarderAmountPerSecondsPromise = ethCallProvider.tryEach(
      rewarderPids.map((pid) => rewarderContractsMap[pid].rewardPerSecond()),
      Array(rewarderPids.length).fill(true),
    )
    const [rewarderTokens, rewarderAmountPerSeconds] = await Promise.all([
      rewarderTokensPromise,
      rewarderAmountPerSecondsPromise,
    ])
    await Promise.all(
      rewarderPids.map((pid) => rewarderContractsMap[pid].rewardPerSecond()),
    )
    const poolsRewarderData = rewarderPids.reduce((acc, pid, i) => {
      const rewarderContract = rewarderContractsMap[pid]
      const rewardTokenAddress = rewarderTokens[i]?.toLowerCase()
      const rewardPerSecond = rewarderAmountPerSeconds[i]
      const rewardPerDay = rewardPerSecond?.mul(oneDaySecs)
      if (!rewardTokenAddress || !rewardPerSecond || !rewardPerDay) return acc
      return {
        ...acc,
        [pid]: {
          rewardTokenAddress,
          rewardPerDay,
          rewardPerSecond,
          rewarderAddress: rewarderContract.address.toLowerCase(),
        },
      }
    }, {} as MinichefRewardersData)
    return poolsRewarderData
  } catch (e) {
    const error = e as Error
    error.message = `Failed to get minichef rewarders data; ${error.message}`
    console.error(error)
    return null
  }
}

export async function getMinichefRewardsUserData(
  library: Web3Provider,
  chainId: ChainId,
  poolAddresses: string[],
  account?: string,
): Promise<MinichefUserData | null> {
  const ethCallProvider = await getMulticallProvider(library, chainId)
  const minichefAddress = MINICHEF_CONTRACT_ADDRESSES[chainId]
  const addressesPidTuples = getPidsForPools(chainId, poolAddresses)
  if (
    !addressesPidTuples.length ||
    !minichefAddress ||
    !ethCallProvider ||
    !account
  )
    return null
  try {
    const minichefContract = new EthcallContract(
      minichefAddress,
      MINICHEF_CONTRACT_ABI,
    ) as MulticallContract<MiniChef>

    // amount of lpToken staked, and SDL reward debt to user
    const userPoolsInfoPromise = ethCallProvider.all(
      addressesPidTuples.map(([, pid]) =>
        minichefContract.userInfo(pid, account),
      ),
    )
    const pendingSDLAmountsPromise = ethCallProvider.all(
      addressesPidTuples.map(([, pid]) =>
        minichefContract.pendingSaddle(pid, account),
      ),
    )
    // TODO rewarderAddresses are already fetched in getMinichefRewardsRewardersData and could be resused
    // addresses of rewarder contracts for third-party rewards
    const rewarderAddressesPromise = ethCallProvider.all(
      addressesPidTuples.map(([, pid]) => minichefContract.rewarder(pid)),
    )
    const [userPoolsInfo, pendingSDLAmounts, rewarderAddresses] =
      await Promise.all([
        userPoolsInfoPromise,
        pendingSDLAmountsPromise,
        rewarderAddressesPromise,
      ])

    const rewarderContractsMap = {} as {
      [pid: number]: MulticallContract<IRewarder>
    }
    rewarderAddresses.forEach((address, i) => {
      if (address !== AddressZero) {
        const pid = addressesPidTuples[i][1]
        rewarderContractsMap[pid] = createMultiCallContract<IRewarder>(
          address,
          IRewarder_ABI,
        )
      }
    })
    const rewarderPids = Object.keys(rewarderContractsMap)
    // @dev note that pendingTokens returns arrays for tokens and values, but will only have 1 entry. See SimpleRewarder
    const usersPoolsPendingTokens = await ethCallProvider.all(
      rewarderPids.map((pid) =>
        rewarderContractsMap[pid].pendingTokens(pid, account, 0),
      ),
    )
    const pidToExternalRewardsMap = rewarderPids.reduce((acc, pid, i) => {
      return {
        ...acc,
        [pid]: usersPoolsPendingTokens[i].rewardAmounts[0], // only has 1 entry
      }
    }, {} as { [pid: number]: BigNumber })

    return addressesPidTuples.reduce((acc, [, pid], i) => {
      const userPoolInfo = userPoolsInfo[i]
      const pendingSDL = pendingSDLAmounts[i]
      const pendingExternal = pidToExternalRewardsMap[pid] || Zero // denominated in rewarder.token
      return {
        ...acc,
        [pid]: {
          amountStaked: userPoolInfo.amount,
          pendingSDL,
          pendingExternal,
        },
      }
    }, {} as MinichefUserData)
  } catch (e) {
    const error = e as Error
    error.message = `Failed to get user minichef data; ${error.message}`
    console.error(error)
    return null
  }
}
