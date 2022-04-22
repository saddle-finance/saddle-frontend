import {
  ChainId,
  POOLS_MAP,
  PoolName,
  PoolTypes,
  Token,
  getIsLegacySwapABIPoolByAddress,
  getMinichefPid,
} from "../constants"
import React, { ReactElement, useEffect, useState } from "react"
import { getContract, getSwapContract, isSynthAsset } from "../utils"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "./../../types/ethers-contracts/Erc20.d"
import { MetaSwap } from "../../types/ethers-contracts/MetaSwap"
import { Web3Provider } from "@ethersproject/providers"
import { getMigrationData } from "../utils/migrations"
import { useActiveWeb3React } from "../hooks"
import { useSelector } from "react-redux"

type SwapInfo = {
  poolAddress: string
  lpToken: string
  typeOfAsset: PoolTypes
  poolName: string
  targetAddress: string | null
  tokens: string[]
  underlyingTokens: string[] | null
  basePoolAddress: string | null
  metaSwapDepositAddress: string | null
  isSaddleApproved: boolean
  isRemoved: boolean
  isGuarded: boolean
  isPaused: boolean
  virtualPrice: BigNumber
  adminFee: BigNumber
  swapFee: BigNumber
  aParameter: BigNumber
  tokenBalances: BigNumber[]
  underlyingTokenBalances: BigNumber[] | null
  lpTokenSupply: BigNumber
  miniChefRewardsPid: number | null
  isMetaSwap: boolean
  isSynthetic: boolean
}

export type BasicPool = {
  isMigrated: boolean
  sdlPerDay: BigNumber // TODO create provider to serve this
} & SwapInfo
export type BasicPools = { [poolName: string]: BasicPool | undefined } | null // indexed by name, which is unique in the Registry

export const BasicPoolsContext = React.createContext<BasicPools>(null)

export default function BasicPoolsProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const { chainId, library } = useActiveWeb3React()
  const [basicPools, setBasicPools] = useState<BasicPools>(null)
  const { lastTransactionTimes } = useSelector(
    (state: AppState) => state.application,
  )

  useEffect(() => {
    async function fetchBasicPools() {
      if (!chainId || !library) {
        setBasicPools(null)
        return
      }
      const pools = await getPoolsBaseData(library, chainId)
      const poolsAddresses = pools.map((pool) => pool.poolAddress)
      const migrationData = await getMigrationData(
        library,
        chainId,
        poolsAddresses,
      )
      const result = pools.reduce((acc, pool) => {
        const poolData = { ...pool } as BasicPool
        poolData.isMigrated = migrationData?.[pool.poolAddress] != null
        return {
          ...acc,
          [pool.poolName]: poolData,
        }
      }, {} as BasicPools)
      setBasicPools(result)
    }
    void fetchBasicPools()
  }, [chainId, library, lastTransactionTimes])

  return (
    <BasicPoolsContext.Provider value={basicPools}>
      {children}
    </BasicPoolsContext.Provider>
  )
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
    const isLegacySwap = getIsLegacySwapABIPoolByAddress(chainId, poolAddress)
    const rewardsPid = getMinichefPid(chainId, poolAddress)
    const tokens = isMetaSwap // @dev this is counterintuitive but will be corrected post-registry
      ? (pool.underlyingPoolTokens as Token[]).map(({ addresses }) =>
          addresses[chainId].toLowerCase(),
        ) // refers to [meta,lp] pair
      : pool.poolTokens.map(({ addresses }) => addresses[chainId].toLowerCase())
    const underlyingTokens = isMetaSwap
      ? pool.poolTokens.map(({ addresses }) => addresses[chainId].toLowerCase())
      : null
    const basePoolAddress = pool.underlyingPool
      ? POOLS_MAP[pool.underlyingPool].addresses[chainId]?.toLowerCase()
      : null
    const typeOfAsset = pool.type
    const isSynthetic = (underlyingTokens || tokens).some((addr) =>
      isSynthAsset(chainId, addr),
    )

    // Swap Contract logic
    const swapContract = getSwapContract(
      library,
      poolAddress,
      { isGuarded, isMetaSwap, isLegacySwap, isMetaSwapDeposit: false }, // make sure metaswapDeposit is correct so we use a contract w balances
    ) as MetaSwap
    if (!swapContract) return null
    const [swapStorage, aParameter, isPaused, virtualPrice] = await Promise.all(
      [
        swapContract.swapStorage(),
        swapContract.getA(),
        swapContract.paused(),
        swapContract.getVirtualPrice(),
      ],
    )
    const { adminFee, swapFee } = swapStorage
    const tokenBalances = await Promise.all(
      tokens.map((_, i) => swapContract.getTokenBalance(i)),
    )

    // LpToken Logic
    const lpTokenContract = getContract(lpToken, ERC20_ABI, library) as Erc20
    if (!lpTokenContract) return null
    const lpTokenSupply = await lpTokenContract.totalSupply()

    return {
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
      underlyingTokenBalances: null,
      lpTokenSupply,
      miniChefRewardsPid: rewardsPid,
      isSynthetic,
    }
  } catch (e) {
    const error = new Error(
      `Unable to getSwapInfo for ${poolName}\n${(e as Error).message}`,
    )
    error.stack = (e as Error).stack
    console.error(error)
    return null
  }
}
