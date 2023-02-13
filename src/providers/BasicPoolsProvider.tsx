import {
  IS_POOL_REGISTRY_MIGRATION_LIVE,
  POOLS_MAP,
  PoolName,
  PoolTypes,
  Token,
  getMinichefPid,
  isWithdrawFeePool,
} from "../constants"
import {
  MulticallCall,
  MulticallContract,
  MulticallProvider,
} from "../types/ethcall"
import React, { ReactElement, useEffect, useState } from "react"
import {
  chunkedTryAll,
  createMultiCallContract,
  enumerate,
  getMulticallProvider,
  isAddressZero,
  isSynthAsset,
  mapToLowerCase,
} from "../utils"
import { usePoolRegistry, usePoolRegistryMultiCall } from "../hooks/useContract"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { ChainId } from "../constants/networks"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "./../../types/ethers-contracts/Erc20.d"
import META_SWAP_ABI from "../constants/abis/metaSwap.json"
import { MetaSwap } from "../../types/ethers-contracts/MetaSwap"
import { PoolRegistry } from "../../types/ethers-contracts/PoolRegistry"
import { Web3Provider } from "@ethersproject/providers"
import { Zero } from "@ethersproject/constants"
import { getMigrationData } from "../utils/migrations"
import { parseBytes32String } from "@ethersproject/strings"
import { useActiveWeb3React } from "../hooks"
import { useSelector } from "react-redux"

type SharedSwapData = {
  adminFee: BigNumber
  futureA: BigNumber
  futureATime: BigNumber
  aParameter: BigNumber
  isGuarded: boolean
  isPaused: boolean
  isRemoved: boolean
  isSaddleApproved: boolean
  isSynthetic: boolean
  isWithdrawFeeAbi: boolean
  lpToken: string
  lpTokenSupply: BigNumber
  miniChefRewardsPid: number | null
  poolAddress: string
  poolName: string
  swapFee: BigNumber
  targetAddress: string | null // the address from which a pool was cloned
  tokenBalances: BigNumber[]
  tokens: string[]
  typeOfAsset: PoolTypes
  virtualPrice: BigNumber
}

type MetaSwapInfo = SharedSwapData & {
  basePoolAddress: string
  isMetaSwap: true
  metaSwapDepositAddress: string
  underlyingTokenBalances: BigNumber[]
  underlyingTokens: string[]
}

type NonMetaSwapInfo = SharedSwapData & {
  basePoolAddress: null
  isMetaSwap: false
  metaSwapDepositAddress: null
  underlyingTokenBalances: null
  underlyingTokens: null
}

type SwapInfo = MetaSwapInfo | NonMetaSwapInfo
type PoolMigrationData =
  | {
      isMigrated: true
      newPoolAddress: string
    }
  | {
      isMigrated: false
      newPoolAddress: undefined
    }

export type BasicPool = SwapInfo & PoolMigrationData
export type BasicPools = Partial<{ [poolName: string]: BasicPool }> | null // indexed by name, which is unique in the Registry

export const BasicPoolsContext = React.createContext<BasicPools>(null)

export default function BasicPoolsProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const { chainId, library } = useActiveWeb3React()
  const [basicPools, setBasicPools] = useState<BasicPools>(null)
  const { lastTransactionTimes } = useSelector(
    (state: AppState) => state.application,
  )

  const poolRegistry = usePoolRegistry()
  const poolRegistryMultiCall = usePoolRegistryMultiCall()
  useEffect(() => {
    async function fetchBasicPools() {
      if (!chainId || !library || !poolRegistry || !poolRegistryMultiCall) {
        setBasicPools(null)
        return
      }
      const ethCallProvider = await getMulticallProvider(library, chainId)
      const pools = IS_POOL_REGISTRY_MIGRATION_LIVE
        ? await getPoolsDataFromRegistry(
            chainId,
            poolRegistry,
            poolRegistryMultiCall,
            ethCallProvider,
          )
        : await getPoolsBaseData(library, chainId)
      const poolsAddresses = pools.map(({ poolAddress }) => poolAddress)
      const migrationData = await getMigrationData(
        library,
        chainId,
        poolsAddresses,
      )
      const result = pools.reduce((acc, pool) => {
        const poolData = { ...pool } as BasicPool
        if (pool.poolAddress && pool.poolName) {
          poolData.isMigrated = migrationData?.[pool.poolAddress] != null
          poolData.newPoolAddress = migrationData?.[pool.poolAddress]
          return {
            ...acc,
            [pool.poolName]: poolData,
          }
        } else {
          return {
            ...acc,
          }
        }
      }, {} as BasicPools)
      setBasicPools(result)
    }
    void fetchBasicPools()
  }, [
    chainId,
    library,
    lastTransactionTimes,
    poolRegistry,
    poolRegistryMultiCall,
  ])

  return (
    <BasicPoolsContext.Provider value={basicPools}>
      {children}
    </BasicPoolsContext.Provider>
  )
}

/**
 * WILL NOT BE USED UNTIL POOLS_MAP and TOKENS_MAP have been fully deprecated in other pages
 * Retrieve PoolData from Registry
 * excludes outdated Pools
 */
/**
 * Get all info about pools that can be read on chain.
 * Excludes price data and user data.
 * Will be replaced with registry.
 */
export async function getPoolsDataFromRegistry(
  chainId: ChainId,
  poolRegistry: PoolRegistry,
  poolRegistryMultiCall: MulticallContract<PoolRegistry>,
  ethCallProvider: MulticallProvider,
): Promise<SwapInfo[]> {
  // curried fn to avoid passing in redundant arguments
  function chunkedTryAll20<T>(calls: MulticallCall<unknown, T>[]) {
    return chunkedTryAll(calls, ethCallProvider, 20)
  }
  try {
    const poolCount = (await poolRegistry.getPoolsLength()).toNumber()
    const registryPoolDataMultiCalls = enumerate(poolCount).map((index) =>
      poolRegistryMultiCall.getPoolDataAtIndex(index),
    )

    const registryPoolData = await ethCallProvider.tryAll(
      registryPoolDataMultiCalls,
    )

    const poolMulticalls = (
      registryPoolData.filter(Boolean) as {
        lpToken: string
        poolAddress: string
      }[]
    ).map(({ lpToken, poolAddress }) => {
      const lpTokenContract = createMultiCallContract<Erc20>(
        lpToken.toLowerCase(),
        ERC20_ABI,
      )
      return [
        lpTokenContract.totalSupply(),
        poolRegistryMultiCall.getA(poolAddress),
        poolRegistryMultiCall.getPaused(poolAddress),
        poolRegistryMultiCall.getSwapStorage(poolAddress),
        poolRegistryMultiCall.getTokenBalances(poolAddress),
        poolRegistryMultiCall.getUnderlyingTokenBalances(poolAddress),
        poolRegistryMultiCall.getVirtualPrice(poolAddress),
      ] as const
    })

    const [
      lpTokensSupplies,
      aParameters,
      arePoolsPaused,
      swapStorages,
      tokensBalances,
      underlyingTokensBalances,
      virtualPrices,
    ] = await Promise.all([
      chunkedTryAll20(poolMulticalls.map((a) => a[0])), // lpTokenSupply
      chunkedTryAll20(poolMulticalls.map((a) => a[1])), // getA
      chunkedTryAll20(poolMulticalls.map((a) => a[2])), // getPaused
      chunkedTryAll20(poolMulticalls.map((a) => a[3])), // getSwapStorage
      chunkedTryAll20(poolMulticalls.map((a) => a[4])), // getTokenBalances
      chunkedTryAll(
        poolMulticalls.map((a) => a[5]),
        ethCallProvider,
        2,
      ), // getUnderlyingTokenBalances
      chunkedTryAll20(poolMulticalls.map((a) => a[6])), // getVirtualPrice
    ])

    const swapInfos: SwapInfo[] = []

    registryPoolData.forEach((poolData, index) => {
      if (poolData == null) return
      const poolAddress = poolData.poolAddress.toLowerCase()
      const poolName = parseBytes32String(poolData.poolName)
      const rewardsPid = getMinichefPid(chainId, poolAddress)
      const isWithdrawFeeAbi = isWithdrawFeePool(poolName)
      const isMetaSwap = !isAddressZero(poolData.metaSwapDepositAddress)
      const isSynthetic = mapToLowerCase(
        isMetaSwap ? poolData.underlyingTokens : poolData.tokens,
      ).some((addr) => isSynthAsset(chainId, addr))
      const isPaused = arePoolsPaused[index]
      const virtualPrice = virtualPrices[index]
      const swapStorage = swapStorages[index]
      const aParameter = aParameters[index]
      const tokenBalances = tokensBalances[index]
      const underlyingTokenBalances =
        underlyingTokensBalances[index] ||
        Array(poolData.underlyingTokens.length).fill(Zero)
      const lpTokenSupply = lpTokensSupplies[index]

      if (
        poolData.isRemoved || // don't include removed pools
        aParameter == null ||
        isPaused == null ||
        lpTokenSupply == null ||
        swapStorage == null ||
        tokenBalances == null ||
        virtualPrice == null
      ) {
        return
      }

      const sharedSwapData = {
        adminFee: swapStorage.adminFee,
        futureA: swapStorage.futureA,
        futureATime: swapStorage.futureATime,
        aParameter,
        basePoolAddress: poolData.basePoolAddress.toLowerCase(),
        isGuarded: poolData.isGuarded,
        isPaused,
        isRemoved: poolData.isRemoved,
        isSaddleApproved: poolData.isSaddleApproved,
        isSynthetic,
        isWithdrawFeeAbi,
        lpToken: poolData.lpToken.toLowerCase(),
        lpTokenSupply,
        metaSwapDepositAddress: poolData.metaSwapDepositAddress.toLowerCase(),
        miniChefRewardsPid: rewardsPid,
        poolAddress,
        poolName,
        swapFee: swapStorage.swapFee,
        targetAddress: poolData.targetAddress.toLowerCase(),
        tokenBalances,
        tokens: mapToLowerCase(poolData.tokens),
        typeOfAsset: poolData.typeOfAsset,
        underlyingTokenBalances,
        underlyingTokens: mapToLowerCase(poolData.underlyingTokens),
        virtualPrice: virtualPrice.isZero()
          ? BigNumber.from(10).pow(18)
          : virtualPrice,
      }
      swapInfos.push(buildMetaInfo(sharedSwapData, isMetaSwap))
    })
    return swapInfos
  } catch (e) {
    const error = new Error(
      `Unable to retrieve pools from the Registry \n${(e as Error).message}`,
    )
    error.stack = (e as Error).stack
    console.error(error)
    return []
  }
}

function buildMetaInfo(
  swapInfo: Omit<MetaSwapInfo | NonMetaSwapInfo, "isMetaSwap">,
  isMetaSwap: boolean,
): MetaSwapInfo | NonMetaSwapInfo {
  if (isMetaSwap === false) {
    return {
      ...swapInfo,
      isMetaSwap: false,
      underlyingTokens: null,
      basePoolAddress: null,
      metaSwapDepositAddress: null,
      underlyingTokenBalances: null,
    } as NonMetaSwapInfo
  }
  return {
    ...swapInfo,
    isMetaSwap: true,
  } as MetaSwapInfo
}

/**
 * Get all info about pools that can be read on chain.
 * Excludes price data and user data.
 * Will be replaced with registry.
 */
export async function getPoolsBaseData(
  library: Web3Provider,
  chainId: ChainId,
): Promise<SwapInfo[]> {
  const targetPools = Object.keys(POOLS_MAP).filter(
    (poolName) => !!POOLS_MAP[poolName].addresses[chainId],
  ) as PoolName[]
  const poolsData = await Promise.all(
    targetPools.map((poolName) => getSwapInfo(library, chainId, poolName)),
  )
  return poolsData.filter(Boolean) as SwapInfo[]
}

export async function getSwapInfo(
  library: Web3Provider,
  chainId: ChainId,
  poolName: PoolName,
): Promise<SwapInfo | null> {
  try {
    /**
     * @dev This function maps the old POOLS_MAP to a more registry-friendly structure.
     * POOLS_MAP has an idiom that `address` for metapools refers to the metaswapDeposit address,
     * and `metaswapAddress` refers to the actual metaswap contract address.
     * Similarly, `tokens` for metapools refers to the metaswapDeposit tokens (eg [susd, usdc, dai, usdt]),
     * and `underlyingTokens` refers to the metaswap tokens (eg [susd, saddleUsdLpToken]).
     *
     * This function corrects the addresses (eg poolAddress -> metaswapContract, metaSwapDepositAddress -> metaswapDepositContract)
     * and also corrects the tokens (eg tokens -> [t1, lpToken], underlyingTokens -> [t1, t2, t3, t4]).
     */
    const ethCallProvider = await getMulticallProvider(library, chainId)
    // Constants
    const pool = POOLS_MAP[poolName]
    const _metaSwapAddress = pool.metaSwapAddresses?.[chainId]?.toLowerCase()
    const _internalAddress = pool.addresses[chainId]?.toLowerCase() // @dev currently points to metaswapDeposit
    const lpToken = pool.lpToken.addresses[chainId]?.toLowerCase()
    const isMetaSwap = !!_metaSwapAddress
    const poolAddress = isMetaSwap ? _metaSwapAddress : _internalAddress
    const metaSwapDepositAddress = isMetaSwap ? _internalAddress : null
    const isGuarded = !!pool.isGuarded
    if (!poolAddress) return null
    const rewardsPid = getMinichefPid(chainId, poolAddress)
    const tokens = isMetaSwap
      ? (pool.underlyingPoolTokens as Token[]).map(({ addresses }) =>
          addresses[chainId].toLowerCase(),
        )
      : pool.poolTokens.map(({ addresses }) => addresses[chainId].toLowerCase())
    const underlyingTokens = isMetaSwap
      ? pool.poolTokens.map(({ addresses }) => addresses[chainId].toLowerCase())
      : null
    const basePoolAddress = pool.underlyingPool
      ? POOLS_MAP[pool.underlyingPool].addresses[chainId]?.toLowerCase()
      : null
    const typeOfAsset = pool.type
    const isSynthetic = (tokens || underlyingTokens || []).some((addr) =>
      isSynthAsset(chainId, addr),
    )
    const isWithdrawFeeAbi = isWithdrawFeePool(poolName)

    // Swap Contract logic
    const swapContractMulticall = createMultiCallContract<MetaSwap>(
      poolAddress,
      META_SWAP_ABI,
    )

    const lpTokenContract = createMultiCallContract<Erc20>(lpToken, ERC20_ABI)

    const [swapStorage, aParameter, isPaused, virtualPrice] =
      await ethCallProvider.all([
        swapContractMulticall.swapStorage(),
        swapContractMulticall.getA(),
        swapContractMulticall.paused(),
        swapContractMulticall.getVirtualPrice(),
      ])
    const { adminFee, swapFee, futureA, futureATime } = swapStorage
    const [lpTokenSupply, ...tokenBalances] = await ethCallProvider.all([
      lpTokenContract.totalSupply(),
      ...tokens.map((_, i) => swapContractMulticall.getTokenBalance(i)),
    ])

    const underlyingTokenBalances = isMetaSwap ? [] : null // TODO

    const data = {
      // Registry Values
      poolAddress,
      lpToken,
      typeOfAsset,
      poolName,
      targetAddress: null,
      tokens,
      underlyingTokens,
      basePoolAddress,
      metaSwapDepositAddress,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded,
      // Non-Registry values
      isPaused,
      isMetaSwap,
      virtualPrice: virtualPrice.isZero()
        ? BigNumber.from(10).pow(18)
        : virtualPrice,
      adminFee,
      swapFee,
      futureA,
      futureATime,
      aParameter,
      isWithdrawFeeAbi,
      tokenBalances, // in native token precision
      underlyingTokenBalances,
      lpTokenSupply,
      miniChefRewardsPid: rewardsPid,
      isSynthetic,
    }
    return isMetaSwap ? (data as MetaSwapInfo) : (data as NonMetaSwapInfo)
  } catch (e) {
    const error = new Error(
      `Unable to getSwapInfo for ${poolName}\n${(e as Error).message}`,
    )
    error.stack = (e as Error).stack
    console.error(error)
    return null
  }
}
