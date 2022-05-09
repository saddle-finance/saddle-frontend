import {
  ChainId,
  POOLS_MAP,
  PoolName,
  PoolTypes,
  Token,
  getMinichefPid,
} from "../constants"
import React, { ReactElement, useEffect, useState } from "react"
import {
  createMultiCallContract,
  getMulticallProvider,
  isSynthAsset,
} from "../utils"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "./../../types/ethers-contracts/Erc20.d"
import META_SWAP_ABI from "../constants/abis/metaSwap.json"
import { MetaSwap } from "../../types/ethers-contracts/MetaSwap"
import { Web3Provider } from "@ethersproject/providers"
import { getMigrationData } from "../utils/migrations"
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
  isMetaSwap: true
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
      underlyingTokenBalances: null,
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
