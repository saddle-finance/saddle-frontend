import { PoolTypes, getMinichefPid } from "../constants"
import {
  enumerate,
  isAddressZero,
  isSynthAsset,
  mapToLowerCase,
} from "../utils"
import { useContractRead, useContractReads } from "wagmi"

import { BigNumber } from "@ethersproject/bignumber"
// import { BigNumber } from "@ethersproject/bignumber"
import ERC20_ABI from "../constants/abis/erc20.json"
import POOL_REGISTRY_ABI from "../constants/abis/poolRegistry.json"
import { Provider } from "@wagmi/core"
// import POOL_REGISTRY_ABI from "../constants/abis/poolRegistry.json"
// import { PoolRegistry } from "../../types/ethers-contracts/PoolRegistry"
// import { Provider } from "@wagmi/core"
import { Zero } from "@ethersproject/constants"
import { parseBytes32String } from "@ethersproject/strings"
// import { enumerate } from "../utils"
import { useMigrationData } from "../utils/migrations"
import { usePoolRegistryAddr } from "../hooks/useContract"

// import { useContractRead, useContractReads } from "wagmi"
// import { usePoolRegistry2, usePoolRegistryAddr } from "../hooks/useContract"

// import { useMigrationData } from "../utils/migrations"

type SwapInfo = MetaSwapInfo | NonMetaSwapInfo
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

export const useRegPools = (poolCount: number, addr: string) => {
  const poolDataAtIndex = enumerate(poolCount).map((index) => {
    return {
      addressOrName: addr,
      contractInterface: POOL_REGISTRY_ABI,
      functionName: "getPoolDataAtIndex",
      args: String(index),
    }
  })
  const { data: registryPools } = useContractReads({
    contracts: poolDataAtIndex,
  })

  return registryPools as unknown as {
    lpToken: string
    poolAddress: string
    underlyingTokens: string[]
    metaSwapDepositAddress: string
    tokens: string[]
    basePoolAddress: string
    isGuarded: boolean
    isRemoved: boolean
    isSaddleApproved: boolean
    poolName: string
    targetAddress: string
    typeOfAsset: PoolTypes
  }[]
}

export const useMappedPools = (
  pools: {
    lpToken: string
    poolAddress: string
    underlyingTokens: string[]
    metaSwapDepositAddress: string
    tokens: string[]
    basePoolAddress: string
    isGuarded: boolean
    isRemoved: boolean
    isSaddleApproved: boolean
    poolName: string
    targetAddress: string
    typeOfAsset: PoolTypes
  }[],
  addr: string,
  chainId: number,
) => {
  const validPools = pools?.filter(Boolean) ?? []
  const poolRegistryReadProperties = (poolAddress: string) => ({
    addressOrName: addr,
    contractInterface: POOL_REGISTRY_ABI,
    args: [poolAddress],
  })
  const aParametersCalls = validPools.map(({ poolAddress }) => ({
    ...poolRegistryReadProperties(poolAddress),
    functionName: "getA",
  }))
  const getPausedCalls = validPools.map(({ poolAddress }) => ({
    ...poolRegistryReadProperties(poolAddress),
    functionName: "getPaused",
  }))
  const getSwapStorageCalls = validPools.map(({ poolAddress }) => ({
    ...poolRegistryReadProperties(poolAddress),
    functionName: "getSwapStorage",
  }))
  const getTokenBalancesCalls = validPools.map(({ poolAddress }) => ({
    ...poolRegistryReadProperties(poolAddress),
    functionName: "getTokenBalances",
  }))
  const getUnderlyingTokenBalances = validPools.map(({ poolAddress }) => ({
    ...poolRegistryReadProperties(poolAddress),
    functionName: "getUnderlyingTokenBalances",
  }))
  const getVirtualPriceCalls = validPools.map(({ poolAddress }) => ({
    ...poolRegistryReadProperties(poolAddress),
    functionName: "getVirtualPrice",
  }))
  const lpTokenAddrs = validPools.map(({ lpToken }) => ({
    addressOrName: lpToken.toLowerCase(),
    contractInterface: ERC20_ABI,
    functionName: "totalSupply",
  }))
  const { data: aParameters } = useContractReads({
    contracts: aParametersCalls,
  })
  const { data: arePoolsPaused } = useContractReads({
    contracts: getPausedCalls,
  })
  const { data: swapStorages } = useContractReads({
    contracts: getSwapStorageCalls,
  })
  const { data: tokensBalances } = useContractReads({
    contracts: getTokenBalancesCalls,
  })
  const { data: underlyingTokensBalances } = useContractReads({
    contracts: getUnderlyingTokenBalances,
  })
  const { data: virtualPricesData } = useContractReads({
    contracts: getVirtualPriceCalls,
  })
  const { data: lpTokensSupplies } = useContractReads({
    contracts: lpTokenAddrs,
  })
  if (
    !arePoolsPaused ||
    !virtualPricesData ||
    !swapStorages ||
    !aParameters ||
    !tokensBalances ||
    !underlyingTokensBalances ||
    !lpTokensSupplies
  )
    return null

  const swapInfos: SwapInfo[] = []
  pools?.forEach((poolDataResult, index) => {
    const poolData = poolDataResult
    if (!chainId || !poolData) return
    const isMetaSwap = !isAddressZero(poolData.metaSwapDepositAddress)
    const rewardsPid = getMinichefPid(
      chainId,
      poolData.poolAddress.toLowerCase(),
    )
    const isSynthetic = mapToLowerCase(
      isMetaSwap ? poolData.underlyingTokens : poolData.tokens,
    ).some((addr) => isSynthAsset(chainId, addr))
    const isPaused = arePoolsPaused[index] as unknown as boolean
    const virtualPrice = virtualPricesData[index] as unknown as BigNumber
    const swapStorage = swapStorages[index] as unknown as SwapInfo
    const aParameter = aParameters[index] as unknown as BigNumber
    const tokenBalances = tokensBalances[index] as unknown as BigNumber[]
    const underlyingTokenBalances = (underlyingTokensBalances[index] ||
      Array(poolData.underlyingTokens?.length).fill(
        Zero,
      )) as unknown as BigNumber[]
    const lpTokenSupply =
      (lpTokensSupplies?.[index] as unknown as BigNumber | undefined) ?? Zero

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
      lpToken: poolData.lpToken.toLowerCase(),
      lpTokenSupply,
      metaSwapDepositAddress: poolData.metaSwapDepositAddress?.toLowerCase(),
      miniChefRewardsPid: rewardsPid,
      poolAddress: poolData.poolAddress.toLowerCase(),
      poolName: parseBytes32String(poolData.poolName),
      swapFee: swapStorage.swapFee,
      targetAddress: poolData.targetAddress?.toLowerCase(),
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
}

export const usePoolsRegistryData = (addr: string) => {
  const { data: poolLength } = useContractRead({
    addressOrName: addr,
    contractInterface: POOL_REGISTRY_ABI,
    functionName: "getPoolsLength",
  })
  const pc = poolLength as unknown as BigNumber | undefined
  const poolCount = pc?.toNumber() ?? 0

  return poolCount
}

export const usePools = (chain: number, provider: Provider) => {
  const poolAddr = usePoolRegistryAddr(chain, provider)
  const poolLen = usePoolsRegistryData(poolAddr)
  const registryPools = useRegPools(poolLen, poolAddr)
  const validPools = useMappedPools(registryPools, poolAddr, chain)
  const migrationData = useMigrationData(registryPools, chain)
  const pools = validPools?.reduce((acc, pool) => {
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
  return pools
}

const buildMetaInfo = (
  swapInfo: Omit<MetaSwapInfo | NonMetaSwapInfo, "isMetaSwap">,
  isMetaSwap: boolean,
): MetaSwapInfo | NonMetaSwapInfo => {
  if (!isMetaSwap) {
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
