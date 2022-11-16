import { BasicPool, BasicPoolsContext } from "./../providers/BasicPoolsProvider"
import {
  BasicToken,
  BasicTokens,
  TokensContext,
} from "../providers/TokensProvider"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "ethers"
import { IS_DEVELOPMENT } from "./../utils/environment"
import { SWAP_TYPES } from "../constants/index"
import { getPriceDataForPool } from "../utils"
import { intersection } from "../utils/index"
import { isMainnet } from "./useContract"
import { useActiveWeb3React } from "."
import { useSelector } from "react-redux"

// swaptypes in order of least to most preferred (aka expensive)
const SWAP_TYPES_ORDERED_ASC = [
  SWAP_TYPES.INVALID,
  SWAP_TYPES.TOKEN_TO_TOKEN,
  SWAP_TYPES.TOKEN_TO_SYNTH,
  SWAP_TYPES.SYNTH_TO_TOKEN,
  SWAP_TYPES.SYNTH_TO_SYNTH,
  SWAP_TYPES.DIRECT,
]

type TokenToPoolsMap = {
  [tokenSymbol: string]: string[] | undefined
}

export type ExpandedBasicPool = BasicPool & {
  priceData: ReturnType<typeof getPriceDataForPool>
  expandedTokens: BasicToken[]
  expandedUnderlyingTokens: BasicToken[] | null
}

type TokenToSwapDataMap = { [symbol: string]: SwapData[] }
export function useCalculateSwapPairs(): (token?: BasicToken) => SwapData[] {
  const [pairCache, setPairCache] = useState<TokenToSwapDataMap>({})
  const basicPools = useContext(BasicPoolsContext)
  const tokens = useContext(TokensContext)
  const { chainId } = useActiveWeb3React()
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  const [poolsSortedByTVL, tokenToPoolsMapSorted] = useMemo(() => {
    if (basicPools === null || tokens === null) return []
    const basicPoolsWithPriceData = Object.values(basicPools)
      .map((pool) => {
        const priceData = getPriceDataForPool(
          tokens,
          pool,
          tokenPricesUSD,
          chainId,
        )
        const expandedTokens = pool.tokens.map((addr) => tokens?.[addr])
        const expandedUnderlyingTokens =
          pool.underlyingTokens?.map((addr) => tokens?.[addr]) || null
        return { ...pool, priceData, expandedTokens, expandedUnderlyingTokens }
      })
      .filter((pool) => !pool.isPaused) // paused pools can't swap
      .filter((expandedPool) => {
        const hasExpandedTokenData = expandedPool.expandedTokens.every(
          (token) => token != null,
        )
        const hasExpandedUnderlyingTokenData =
          expandedPool.expandedUnderlyingTokens === null ||
          expandedPool.expandedUnderlyingTokens?.every((token) => token != null)
        const shouldInclude =
          hasExpandedTokenData && hasExpandedUnderlyingTokenData
        if (!shouldInclude && IS_DEVELOPMENT) {
          console.error(
            `Could not find tokens for pool ${
              expandedPool.poolName
            } ${JSON.stringify({
              hasExpandedTokenData,
              hasExpandedUnderlyingTokenData,
            })}`,
          )
        }
        return shouldInclude
      }) as ExpandedBasicPool[] // make sure we have enough data about a pool
    const sortedPools = basicPoolsWithPriceData.sort((a, b) => {
      const aTVL: BigNumber = a.priceData?.tokenBalancesSumUSD
      const bTVL = b.priceData?.tokenBalancesSumUSD
      if (aTVL && bTVL) {
        return aTVL.gt(bTVL) ? -1 : 1
      }
      return aTVL ? -1 : 1
    })

    // map of tokenAddress to poolName[]
    const tokenToPools = sortedPools.reduce((acc, pool) => {
      const newAcc = { ...acc }
      ;(pool.underlyingTokens || pool.tokens).forEach((addr) => {
        newAcc[addr] = (newAcc[addr] || []).concat(pool.poolName)
      })
      return newAcc
    }, {} as TokenToPoolsMap)
    return [sortedPools, tokenToPools]
  }, [basicPools, tokens, tokenPricesUSD, chainId]) // TODO reduce refresh rate caused by tokenPricesUSD

  useEffect(() => {
    // @dev clear cache when moving chains
    setPairCache({})
  }, [chainId])

  return useCallback(
    function calculateSwapPairs(token?: BasicToken): SwapData[] {
      if (token == null || chainId == null || tokens === null) return []
      const cacheHit = pairCache[token.symbol]
      if (cacheHit) return cacheHit
      const originTokenAddress = token.address.toLowerCase()
      const originToken = tokens[originTokenAddress]
      if (!originToken) return []
      const swapPairs = getTradingPairsForToken(
        tokens,
        poolsSortedByTVL || [],
        tokenToPoolsMapSorted || {},
        originToken,
        isMainnet(chainId), // virtualSwap only supports mainnet
      )
      setPairCache((prevState) => ({
        ...prevState,
        [token.address]: swapPairs,
      }))
      return swapPairs
    },
    [pairCache, tokens, poolsSortedByTVL, tokenToPoolsMapSorted, chainId],
  )
}

function buildSwapSideData(token: BasicToken): SwapSide
function buildSwapSideData(
  token: BasicToken,
  pool: ExpandedBasicPool,
): Required<SwapSide>
function buildSwapSideData(
  token: BasicToken,
  pool?: ExpandedBasicPool,
): Required<SwapSide> | SwapSide {
  return {
    address: token.address,
    symbol: token.symbol,
    poolName: pool?.poolName,
    tokenIndex: (pool?.underlyingTokens || pool?.tokens || []).findIndex(
      (addr) => addr === token.address,
    ), // @dev note we're assuming we use the metaswapDeposit address, thus we're only looking at underlying tokens
  }
}

export type SwapSide = {
  address: string
  symbol: string
  poolName?: string
  tokenIndex?: number
}

export type SwapData =
  | {
      from: Required<SwapSide>
      to: Required<SwapSide>
      type: Exclude<SWAP_TYPES, SWAP_TYPES.INVALID>
      route: string[]
    }
  | {
      from: SwapSide
      to: SwapSide
      type: SWAP_TYPES.INVALID
      route: string[]
    }

function getTradingPairsForToken(
  tokensMap: NonNullable<BasicTokens>,
  poolsSortedByTVL: ExpandedBasicPool[],
  tokenToPoolsMap: TokenToPoolsMap,
  originToken: BasicToken,
  allowVirtualSwap: boolean,
): SwapData[] {
  const poolsMap: { [poolName: string]: ExpandedBasicPool } =
    poolsSortedByTVL.reduce(
      (acc, pool) => ({ ...acc, [pool.poolName]: pool }),
      {},
    )
  const allTokens = Object.values(tokensMap).filter(
    ({ isLPToken, address }) => !isLPToken && tokenToPoolsMap[address],
  ) // @dev tokens includes non-pool tokens like rewards as well, so filter only tokens in pools
  const synthPoolsSet = new Set(
    poolsSortedByTVL.filter(({ isSynthetic }) => isSynthetic),
  )
  const originTokenPoolsSet = new Set(
    (tokenToPoolsMap[originToken.address] || []).map(
      (poolName) => poolsMap[poolName],
    ),
  )
  const originPoolsSynthSet = intersection(synthPoolsSet, originTokenPoolsSet)
  const tokenToSwapDataMap: { [symbol: string]: SwapData } = {} // object is used for deduping

  allTokens.forEach((token) => {
    // Base Case: Invalid trade, eg token with itself
    const invalidSwap: SwapData = {
      from: buildSwapSideData(originToken),
      to: buildSwapSideData(token),
      type: SWAP_TYPES.INVALID,
      route: [],
    }
    let swapData: SwapData = invalidSwap
    const tokenPoolsSet = new Set(
      (tokenToPoolsMap[token.address] || []).map(
        (poolName) => poolsMap[poolName],
      ),
    )
    const tokenPoolsSynthSet = intersection(synthPoolsSet, tokenPoolsSet)
    const sharedPoolsSet = intersection(originTokenPoolsSet, tokenPoolsSet)

    /**
     * sToken = synth, Token = nonsynth
     * sPool = synth, BasicPool = nonsynth
     * sPool(TokenA) <> sTokenB = nonsynth token in synth pool swapping with synth token
     */

    // Case 1: TokenA <> TokenA
    if (originToken.address === token.address) {
      // fall through to default "invalid" swapData
    }
    // Case 2: poolA(TokenA) <> poolA(TokenB)
    else if (sharedPoolsSet.size > 0) {
      const tradePool = [...sharedPoolsSet][0]
      swapData = {
        type: SWAP_TYPES.DIRECT,
        from: buildSwapSideData(originToken, tradePool),
        to: buildSwapSideData(token, tradePool),
        route: [originToken.symbol, token.symbol],
      }
    } else if (!allowVirtualSwap) {
      // fall through to default "invalid" swapData
    }

    // Case 3: sTokenA <> sTokenB
    else if (originToken.isSynthetic && token.isSynthetic) {
      const originPool = [...originTokenPoolsSet][0]
      const destinationPool = [...tokenPoolsSet][0]
      swapData = {
        type: SWAP_TYPES.SYNTH_TO_SYNTH,
        from: buildSwapSideData(originToken, originPool),
        to: buildSwapSideData(token, destinationPool),
        route: [originToken.symbol, token.symbol],
      }
    }

    // Case 4: sTokenA <> sPool(TokenB)
    else if (
      originToken.isSynthetic &&
      !token.isSynthetic &&
      tokenPoolsSynthSet.size > 0
    ) {
      const originPool = [...originTokenPoolsSet][0]
      const destinationPool = [...tokenPoolsSynthSet][0]
      const middleSynth = (
        destinationPool.expandedUnderlyingTokens ||
        destinationPool.expandedTokens
      ).find(({ isSynthetic }) => isSynthetic)
      if (middleSynth) {
        swapData = {
          type: SWAP_TYPES.SYNTH_TO_TOKEN,
          from: buildSwapSideData(originToken, originPool),
          to: buildSwapSideData(token, destinationPool),
          route: [originToken.symbol, middleSynth.symbol, token.symbol],
        }
      }
    }

    // Case 5: sPoolA(TokenA) <> sPoolB(TokenB)
    else if (
      !originToken.isSynthetic &&
      originPoolsSynthSet.size > 0 &&
      !token.isSynthetic &&
      tokenPoolsSynthSet.size > 0
    ) {
      const originPool = [...originPoolsSynthSet][0]
      const destinationPool = [...tokenPoolsSynthSet][0]
      const originSynth = (
        originPool.expandedUnderlyingTokens || originPool.expandedTokens
      ).find(({ isSynthetic }) => isSynthetic)
      const destinationSynth = (
        destinationPool.expandedUnderlyingTokens ||
        destinationPool.expandedTokens
      ).find(({ isSynthetic }) => isSynthetic)
      if (originSynth && destinationSynth) {
        swapData = {
          type: SWAP_TYPES.TOKEN_TO_TOKEN,
          from: buildSwapSideData(originToken, originPool),
          to: buildSwapSideData(token, destinationPool),
          route: [
            originToken.symbol,
            originSynth.symbol,
            destinationSynth.symbol,
            token.symbol,
          ],
        }
      }
    }

    // Case 6: sPool(TokenA) <> sTokenB
    else if (
      !originToken.isSynthetic &&
      originPoolsSynthSet.size > 0 &&
      token.isSynthetic
    ) {
      const originPool = [...originPoolsSynthSet][0]
      const destinationPool = [...tokenPoolsSet][0]
      const middleSynth = (
        originPool.expandedUnderlyingTokens || originPool.expandedTokens
      ).find(({ isSynthetic }) => isSynthetic)
      if (middleSynth) {
        swapData = {
          type: SWAP_TYPES.TOKEN_TO_SYNTH,
          from: buildSwapSideData(originToken, originPool),
          to: buildSwapSideData(token, destinationPool),
          route: [originToken.symbol, middleSynth.symbol, token.symbol],
        }
      }
    }
    // validate that origin and dest token idxs are found
    if (
      (swapData.from.tokenIndex == null ||
        swapData.to.tokenIndex == null ||
        swapData.from.tokenIndex === -1 ||
        swapData.to.tokenIndex === -1) &&
      swapData.type !== SWAP_TYPES.INVALID
    ) {
      IS_DEVELOPMENT &&
        console.log(`Found invalid swap: ${JSON.stringify(swapData)}`)
      swapData = invalidSwap
    }

    // use this swap only if we haven't already calculated a better swap for the pair
    const existingTokenSwapData: SwapData | undefined =
      tokenToSwapDataMap[token.address]
    const existingSwapIdx = SWAP_TYPES_ORDERED_ASC.indexOf(
      existingTokenSwapData?.type,
    )
    const newSwapIdx = SWAP_TYPES_ORDERED_ASC.indexOf(swapData.type)
    if (!existingTokenSwapData || newSwapIdx > existingSwapIdx) {
      tokenToSwapDataMap[token.address] = swapData
    }
  })
  return Object.values(tokenToSwapDataMap)
}

export const __test__ = {
  getTradingPairsForToken,
}
