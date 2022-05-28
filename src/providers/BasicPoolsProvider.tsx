import {
  ChainId,
  POOLS_MAP,
  PoolName,
  PoolTypes,
  Token,
  getMinichefPid,
} from "../constants"
import {
  DeepNullable,
  createMultiCallContract,
  enumerate,
  getMulticallProvider,
  isAddressZero,
  isSynthAsset,
  lowerCaseAddresses,
  multicallInBatch,
} from "../utils"
import {
  MulticallCall,
  MulticallContract,
  MulticallProvider,
} from "../types/ethcall"

import React, { ReactElement, useEffect, useState } from "react"
import { usePoolRegistry, usePoolRegistryMultiCall } from "../hooks/useContract"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "./../../types/ethers-contracts/Erc20.d"
import META_SWAP_ABI from "../constants/abis/metaSwap.json"
import { MetaSwap } from "../../types/ethers-contracts/MetaSwap"
import { PoolRegistry } from "../../types/ethers-contracts/PoolRegistry"
import { Web3Provider } from "@ethersproject/providers"
import { getMigrationData } from "../utils/migrations"
import { parseBytes32String } from "ethers/lib/utils"
import { useActiveWeb3React } from "../hooks"
import { useSelector } from "react-redux"

type SharedSwapData = {
  poolAddress: string
  lpToken: string
  typeOfAsset: PoolTypes
  poolName: string
  targetAddress: string | null
  tokens: string[]
  isSaddleApproved: boolean
  isRemoved: boolean
  isGuarded: boolean
  isPaused: boolean
  virtualPrice: BigNumber
  adminFee: BigNumber
  swapFee: BigNumber
  aParameter: BigNumber
  tokenBalances: BigNumber[]
  lpTokenSupply: BigNumber
  miniChefRewardsPid: number | null
  isSynthetic: boolean
}

type MetaSwapInfo = SharedSwapData & {
  underlyingTokens: string[]
  basePoolAddress: string
  metaSwapDepositAddress: string
  underlyingTokenBalances: BigNumber[]
  isMetaSwap: boolean
}

type NonMetaSwapInfo = SharedSwapData & {
  underlyingTokens: null
  basePoolAddress: null
  metaSwapDepositAddress: null
  underlyingTokenBalances: null
  isMetaSwap: false
}

type SwapInfo = MetaSwapInfo | NonMetaSwapInfo

export type BasicPool = {
  isMigrated: boolean
  newPoolAddresss?: string
} & SwapInfo
export type BasicPools = { [poolName: string]: BasicPool | undefined } | null // indexed by name, which is unique in the Registry

type SwapStorage = [
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  string,
] & {
  initialA: BigNumber
  futureA: BigNumber
  initialATime: BigNumber
  futureATime: BigNumber
  swapFee: BigNumber
  adminFee: BigNumber
  lpToken: string
}

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
      const pools = await getPoolsDataFromRegistry(
        chainId,
        poolRegistry,
        poolRegistryMultiCall,
        ethCallProvider,
      )
      const poolsAddresses = pools
        .map(({ poolAddress }) => poolAddress)
        .filter(Boolean) as string[]
      const migrationData = await getMigrationData(
        library,
        chainId,
        poolsAddresses,
      )
      const result = pools.reduce((acc, pool) => {
        const poolData = { ...pool } as BasicPool
        if (pool.poolAddress && pool.poolName) {
          poolData.isMigrated = migrationData?.[pool.poolAddress] != null
          poolData.newPoolAddresss = migrationData?.[pool.poolAddress]
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
): Promise<DeepNullable<SwapInfo>[]> {
  const poolCount = (await poolRegistry.getPoolsLength()).toNumber()
  const registryPoolDataMultiCalls = enumerate(poolCount).map((index) =>
    poolRegistryMultiCall.getPoolDataAtIndex(index),
  )

  const registryPoolData = await ethCallProvider.tryAll(
    registryPoolDataMultiCalls,
  )

  const arePoolsPausedMulticalls: MulticallCall<unknown, boolean>[] = []
  const virtualPricesMulticalls: MulticallCall<unknown, BigNumber>[] = []
  const swapStoragesMulticalls: MulticallCall<unknown, SwapStorage>[] = []
  const aParametersMultiCalls: MulticallCall<unknown, BigNumber>[] = []
  const tokenBalancesMultiCalls: MulticallCall<unknown, BigNumber[]>[] = []
  const underlyingTokenBalancesMultiCalls: MulticallCall<
    unknown,
    BigNumber[]
  >[] = []
  const lpTokenTotalSuppliesMultiCalls: MulticallCall<unknown, BigNumber>[] = []

  registryPoolData.forEach((poolData) => {
    if (poolData != null) {
      const { lpToken, poolAddress } = poolData
      const lpTokenContract = createMultiCallContract<Erc20>(
        lpToken.toLowerCase(),
        ERC20_ABI,
      )

      lpTokenTotalSuppliesMultiCalls.push(lpTokenContract.totalSupply())
      arePoolsPausedMulticalls.push(
        poolRegistryMultiCall.getPaused(poolAddress),
      )
      virtualPricesMulticalls.push(
        poolRegistryMultiCall.getVirtualPrice(poolAddress),
      )
      swapStoragesMulticalls.push(
        poolRegistryMultiCall.getSwapStorage(poolAddress),
      )
      aParametersMultiCalls.push(poolRegistryMultiCall.getA(poolAddress))
      tokenBalancesMultiCalls.push(
        poolRegistryMultiCall.getTokenBalances(poolAddress),
      )
      underlyingTokenBalancesMultiCalls.push(
        poolRegistryMultiCall.getUnderlyingTokenBalances(poolAddress),
      )
    }
  })

  const [
    arePoolsPaused,
    virtualPrices,
    swapStorages,
    aParameters,
    tokensBalances,
    underlyingTokensBalances,
    lpTokensSupplies,
  ] = await Promise.all([
    ethCallProvider.tryAll(arePoolsPausedMulticalls),
    ethCallProvider.tryAll(virtualPricesMulticalls),
    ethCallProvider.tryAll(swapStoragesMulticalls),
    ethCallProvider.tryAll(aParametersMultiCalls),
    ethCallProvider.tryAll(tokenBalancesMultiCalls),
    multicallInBatch<BigNumber[]>(
      underlyingTokenBalancesMultiCalls,
      ethCallProvider,
      2,
    ),
    ethCallProvider.tryAll(lpTokenTotalSuppliesMultiCalls),
  ])

  const swapInfos: DeepNullable<SwapInfo>[] = []

  registryPoolData.forEach((poolData, index) => {
    if (poolData != null) {
      const isMetaSwap = !isAddressZero(poolData.metaSwapDepositAddress)
      const rewardsPid = getMinichefPid(
        chainId,
        poolData.poolAddress.toLowerCase(),
      )
      const isSynthetic = (
        lowerCaseAddresses(poolData.tokens) ||
        underlyingTokensBalances[index] ||
        []
      ).some((addr) => isSynthAsset(chainId, addr || ""))
      const isPaused = arePoolsPaused[index]
      const virtualPrice = virtualPrices[index]
      const swapStorage = swapStorages[index]
      const aParameter = aParameters[index]
      const tokenBalances = tokensBalances[index]
      const underlyingTokenBalances = underlyingTokensBalances[index]
      const lpTokenSupply = lpTokensSupplies[index]

      if (
        isPaused == null ||
        virtualPrice == null ||
        aParameter == null ||
        swapStorage == null ||
        tokenBalances == null ||
        lpTokenSupply == null
      ) {
        return
      }

      swapInfos.push({
        poolAddress: poolData.poolAddress.toLowerCase(),
        lpToken: poolData.lpToken.toLowerCase(),
        typeOfAsset: poolData.typeOfAsset,
        poolName: parseBytes32String(poolData.poolName),
        targetAddress: poolData.targetAddress,
        tokens: lowerCaseAddresses(poolData.tokens),
        underlyingTokens: lowerCaseAddresses(poolData.underlyingTokens),
        basePoolAddress: poolData.basePoolAddress,
        metaSwapDepositAddress: poolData.metaSwapDepositAddress,
        isSaddleApproved: poolData.isSaddleApproved,
        isRemoved: poolData.isRemoved,
        isGuarded: poolData.isGuarded,
        isMetaSwap,
        isPaused,
        virtualPrice: virtualPrice.isZero()
          ? BigNumber.from(10).pow(18)
          : virtualPrice,
        adminFee: swapStorage.adminFee,
        swapFee: swapStorage.swapFee,
        aParameter,
        tokenBalances,
        underlyingTokenBalances,
        lpTokenSupply,
        miniChefRewardsPid: rewardsPid,
        isSynthetic,
      })
    }
  })

  return swapInfos
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
    const { adminFee, swapFee } = swapStorage
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
      aParameter,
      tokenBalances, // in native token precision
      underlyingTokenBalances,
      lpTokenSupply,
      miniChefRewardsPid: rewardsPid,
      isSynthetic,
    }
    return isMetaSwap
      ? (data as unknown as MetaSwapInfo) // TODO can we be more sure of this?
      : (data as NonMetaSwapInfo)
  } catch (e) {
    const error = new Error(
      `Unable to getSwapInfo for ${poolName}\n${(e as Error).message}`,
    )
    error.stack = (e as Error).stack
    console.error(error)
    return null
  }
}
