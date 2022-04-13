import {
  ChainId,
  MINICHEF_CONTRACT_ADDRESSES,
  getMinichefPid,
} from "../constants"

import { AddressZero } from "@ethersproject/constants"
import { BigNumber } from "@ethersproject/bignumber"
import { Contract } from "@ethersproject/contracts"
import { Contract as EthcallContract } from "ethcall"
import { IRewarder } from "../../types/ethers-contracts/IRewarder"
import IRewarder_ABI from "../constants/abis/IRewarder.json"
import MINICHEF_CONTRACT_ABI from "../constants/abis/miniChef.json"
import { MiniChef } from "../../types/ethers-contracts/MiniChef"
import { MulticallContract } from "../types/ethcall"
import { Web3Provider } from "@ethersproject/providers"
import { getMulticallProvider } from "."

type MinichefPoolsData = {
  [poolAddress: string]: {
    sdlPerDay: BigNumber
    pid: number
    rewards?: RewardsData
  }
}
type MinichefUserData = {
  [pid: number]: {
    amountStaked: BigNumber
    rewardDebt: BigNumber
  }
} | null
type RewardsData = {
  rewarderAddress: string
  rewardPerSecond: BigNumber
  rewardPerDay: BigNumber
  rewardTokenAddress: string
}
type MinichefRewardersData = {
  [pid: number]: RewardsData
}
const oneDaySecs = BigNumber.from(24 * 60 * 60)

/**
 * Returns sdlPerDay and pid from minichef for the given pool addresses.
 */
export async function getMinichefRewardsPoolsData(
  library: Web3Provider,
  chainId: ChainId,
  poolAddresses: string[],
): Promise<MinichefPoolsData | null> {
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
    const [saddlePerSecond, totalAllocPoint] = await ethCallProvider.tryEach(
      [minichefContract.saddlePerSecond(), minichefContract.totalAllocPoint()],
      [false, false],
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
    }, {} as MinichefPoolsData)

    return poolsData
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
    const minichefContract = new EthcallContract(
      minichefAddress,
      MINICHEF_CONTRACT_ABI,
    ) as MulticallContract<MiniChef>
    // Fetch Rewarder Data
    const rewarderAddresses = await ethCallProvider.tryEach(
      addressesPidTuples.map(([, pid]) => minichefContract.rewarder(pid)),
      Array(addressesPidTuples.length).fill(true),
    )
    const rewarderContractsMap = {} as { [pid: number]: IRewarder }
    rewarderAddresses.forEach((address, i) => {
      if (address !== AddressZero) {
        const pid = addressesPidTuples[i][1]
        rewarderContractsMap[pid] = new Contract(
          address,
          IRewarder_ABI,
          library,
        ) as IRewarder
      }
    })
    // const rewarderTokens = {} as { [pid: number]: string }
    const rewarderPids = Object.keys(rewarderContractsMap)
    const rewarderTokens = await Promise.all(
      rewarderPids.map((pid) => rewarderContractsMap[pid].rewardToken()),
    )
    const rewarderAmountPerSeconds = await Promise.all(
      rewarderPids.map((pid) => rewarderContractsMap[pid].rewardPerSecond()),
    )
    const poolsRewarderData = rewarderPids.reduce((acc, pid, i) => {
      const rewarderContract = rewarderContractsMap[pid]
      const rewardTokenAddress = rewarderTokens[i]
      const rewardPerSecond = rewarderAmountPerSeconds[i]
      const rewardPerDay = rewardPerSecond.mul(oneDaySecs)
      return {
        ...acc,
        [pid]: {
          rewardTokenAddress,
          rewardPerDay,
          rewardPerSecond,
          rewarderAddress: rewarderContract.address,
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
    const userPoolsInfo = await ethCallProvider.tryEach(
      addressesPidTuples.map(([, pid]) =>
        minichefContract.userInfo(pid, account),
      ),
      Array(addressesPidTuples.length).fill(true),
    )
    return userPoolsInfo.reduce((acc, poolInfo, i) => {
      const [, pid] = addressesPidTuples[i]
      return {
        ...acc,
        [pid]: {
          amountStaked: poolInfo.amount,
          rewardDebt: poolInfo.rewardDebt,
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
