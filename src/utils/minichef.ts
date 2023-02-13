import { AddressZero, Zero } from "@ethersproject/constants"
import { BN_1E18, MINICHEF_CONTRACT_ADDRESSES } from "../constants"
import { createMultiCallContract, getMulticallProvider } from "."

import { BasicPool } from "../providers/BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import { ChainId } from "../constants/networks"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
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
  pctOfSupplyStaked: BigNumber
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
type PoolInfo = Pick<
  BasicPool,
  "poolAddress" | "lpToken" | "miniChefRewardsPid" | "lpTokenSupply"
>
type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>
} // TODO move to types file

function getPoolsWithPids(pools: PoolInfo[]) {
  return pools.filter(
    ({ miniChefRewardsPid }) => miniChefRewardsPid,
  ) as NonNullableFields<PoolInfo>[]
}

/**
 * Returns sdlPerDay and pid from minichef for the given pool addresses.
 */
export async function getMinichefRewardsPoolsData(
  library: Web3Provider,
  chainId: ChainId,
  poolData: PoolInfo[],
): Promise<MinichefData | null> {
  const ethCallProvider = await getMulticallProvider(library, chainId)
  const minichefAddress = MINICHEF_CONTRACT_ADDRESSES[chainId]
  const poolsWithPids = getPoolsWithPids(poolData)
  if (!poolsWithPids.length || !minichefAddress || !ethCallProvider) return null
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
    const poolInfos = await ethCallProvider.tryAll(
      poolsWithPids.map(({ miniChefRewardsPid: pid }) =>
        minichefContract.poolInfo(pid),
      ),
    )

    // Fetch minichef LP balances
    const minichefLPBalances = await ethCallProvider.tryAll(
      poolsWithPids.map(({ lpToken }) => {
        const lpTokenContract = createMultiCallContract<Erc20>(
          lpToken,
          ERC20_ABI,
        )
        return lpTokenContract.balanceOf(minichefAddress)
      }),
    )

    // Fetch Rewarder Data
    const rewardersData = await getMinichefRewardsRewardersData(
      library,
      chainId,
      poolData,
    )

    // Aggregate Data
    const poolsData = poolsWithPids.reduce(
      (acc, { poolAddress, miniChefRewardsPid: pid, lpTokenSupply }, i) => {
        const poolInfo = poolInfos[i]
        const rewardsData = rewardersData?.[pid]
        const miniChefLpBalance = minichefLPBalances[i] || Zero
        if (poolInfo) {
          const pctOfSupplyStaked = lpTokenSupply.gt(Zero)
            ? miniChefLpBalance.mul(BN_1E18).div(lpTokenSupply)
            : Zero
          const sdlPerDay = saddlePerSecond
            .mul(oneDaySecs)
            .mul(poolInfo.allocPoint)
            .div(totalAllocPoint)
          return {
            [poolAddress]: {
              sdlPerDay,
              pid,
              pctOfSupplyStaked,
              ...({ rewards: rewardsData } || {}),
            },
            ...acc,
          }
        }
        return acc
      },
      {} as { [address: string]: MinichefPoolData },
    )
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

export async function getMinichefRewardsRewardersData(
  library: Web3Provider,
  chainId: ChainId,
  poolData: PoolInfo[],
): Promise<MinichefRewardersData | null> {
  const ethCallProvider = await getMulticallProvider(library, chainId)
  const minichefAddress = MINICHEF_CONTRACT_ADDRESSES[chainId]
  const poolsWithPids = getPoolsWithPids(poolData)
  if (!poolsWithPids.length || !minichefAddress || !ethCallProvider) return null
  try {
    const minichefContract = createMultiCallContract<MiniChef>(
      minichefAddress,
      MINICHEF_CONTRACT_ABI,
    )
    // Fetch Rewarder Data
    const rewarderAddresses = await ethCallProvider.tryAll(
      poolsWithPids.map(({ miniChefRewardsPid: pid }) =>
        minichefContract.rewarder(pid),
      ),
    )
    const rewarderContractsMap = {} as {
      [pid: number]: MulticallContract<IRewarder>
    }
    rewarderAddresses.forEach((address, i) => {
      if (address && address !== AddressZero) {
        const pid = poolsWithPids[i].miniChefRewardsPid
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
  poolData: PoolInfo[],
  account?: string,
): Promise<MinichefUserData | null> {
  const ethCallProvider = await getMulticallProvider(library, chainId)
  const minichefAddress = MINICHEF_CONTRACT_ADDRESSES[chainId]
  const poolsWithPids = getPoolsWithPids(poolData)
  if (!poolsWithPids.length || !minichefAddress || !ethCallProvider || !account)
    return null
  try {
    const minichefContract = new EthcallContract(
      minichefAddress,
      MINICHEF_CONTRACT_ABI,
    ) as MulticallContract<MiniChef>

    // amount of lpToken staked, and SDL reward debt to user
    const userPoolsInfoPromise = ethCallProvider.all(
      poolsWithPids.map(({ miniChefRewardsPid: pid }) =>
        minichefContract.userInfo(pid, account),
      ),
    )
    const pendingSDLAmountsPromise = ethCallProvider.all(
      poolsWithPids.map(({ miniChefRewardsPid: pid }) =>
        minichefContract.pendingSaddle(pid, account),
      ),
    )
    // TODO rewarderAddresses are already fetched in getMinichefRewardsRewardersData and could be resused
    // addresses of rewarder contracts for third-party rewards
    const rewarderAddressesPromise = ethCallProvider.all(
      poolsWithPids.map(({ miniChefRewardsPid: pid }) =>
        minichefContract.rewarder(pid),
      ),
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
        const pid = poolsWithPids[i].miniChefRewardsPid
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

    return poolsWithPids.reduce((acc, { miniChefRewardsPid: pid }, i) => {
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
