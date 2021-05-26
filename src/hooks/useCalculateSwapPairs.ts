import {
  POOLS_MAP,
  Pool,
  PoolsMap,
  SWAP_TYPES,
  TOKENS_MAP,
  TOKEN_TO_POOLS_MAP,
  Token,
  TokenToPoolsMap,
  TokensMap,
} from "../constants/index"

import { intersection } from "../utils/index"
import { useState } from "react"

// swaptypes in order of least to most preferred (aka expensive)
const SWAP_TYPES_ORDERED_ASC = [
  SWAP_TYPES.INVALID,
  SWAP_TYPES.TOKEN_TO_TOKEN,
  SWAP_TYPES.TOKEN_TO_SYNTH,
  SWAP_TYPES.SYNTH_TO_TOKEN,
  SWAP_TYPES.SYNTH_TO_SYNTH,
  SWAP_TYPES.DIRECT,
]

type TokenToSwapDataMap = { [symbol: string]: SwapData[] }
export function useCalculateSwapPairs(): (token?: Token) => SwapData[] {
  const [pairCache, setPairCache] = useState<TokenToSwapDataMap>({})

  return function calculateSwapPairs(token?: Token): SwapData[] {
    if (!token) return []
    const cacheHit = pairCache[token.symbol]
    if (cacheHit) return cacheHit
    const swapPairs = getTradingPairsForToken(
      TOKENS_MAP,
      POOLS_MAP,
      TOKEN_TO_POOLS_MAP,
      token,
    )
    setPairCache((prevState) => ({ ...prevState, [token.symbol]: swapPairs }))
    return swapPairs
  }
}

function buildSwapSideData(token: Token): SwapSide
function buildSwapSideData(token: Token, pool: Pool): Required<SwapSide>
function buildSwapSideData(
  token: Token,
  pool?: Pool,
): Required<SwapSide> | SwapSide {
  return {
    symbol: token.symbol,
    poolName: pool?.name,
    tokenIndex: pool?.poolTokens.findIndex((t) => t === token),
  }
}

export type SwapSide = {
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
  tokensMap: TokensMap,
  poolsMap: PoolsMap,
  tokenToPoolsMap: TokenToPoolsMap,
  originToken: Token,
): SwapData[] {
  const allTokens = Object.values(tokensMap)
  const synthPoolsSet = new Set(
    Object.values(poolsMap).filter(({ isSynthetic }) => isSynthetic),
  )
  const originTokenPoolsSet = new Set(
    tokenToPoolsMap[originToken.symbol].map((poolName) => poolsMap[poolName]),
  )
  const originPoolsSynthSet = intersection(synthPoolsSet, originTokenPoolsSet)
  const tokenToSwapDataMap: { [symbol: string]: SwapData } = {} // object is used for deduping

  allTokens.forEach((token) => {
    // Base Case: Invalid trade, eg token with itself
    let swapData: SwapData = {
      from: buildSwapSideData(originToken),
      to: buildSwapSideData(token),
      type: SWAP_TYPES.INVALID,
      route: [],
    }
    const tokenPoolsSet = new Set(
      tokenToPoolsMap[token.symbol].map((poolName) => poolsMap[poolName]),
    )
    const tokenPoolsSynthSet = intersection(synthPoolsSet, tokenPoolsSet)
    const sharedPoolsSet = intersection(originTokenPoolsSet, tokenPoolsSet)

    /**
     * sToken = synth, Token = nonsynth
     * sPool = synth, Pool = nonsynth
     * sPool(TokenA) <> sTokenB = nonsynth token in synth pool swapping with synth token
     */

    // Case 1: TokenA <> TokenA
    if (originToken === token) {
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
      const middleSynth = destinationPool.poolTokens.find(
        ({ isSynthetic }) => isSynthetic,
      )
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
      const originSynth = originPool.poolTokens.find(
        ({ isSynthetic }) => isSynthetic,
      )
      const destinationSynth = destinationPool.poolTokens.find(
        ({ isSynthetic }) => isSynthetic,
      )
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
      const middleSynth = originPool.poolTokens.find(
        ({ isSynthetic }) => isSynthetic,
      )
      if (middleSynth) {
        swapData = {
          type: SWAP_TYPES.TOKEN_TO_SYNTH,
          from: buildSwapSideData(originToken, originPool),
          to: buildSwapSideData(token, destinationPool),
          route: [originToken.symbol, middleSynth.symbol, token.symbol],
        }
      }
    }

    // use this swap only if we haven't already calculated a better swap for the pair
    const existingTokenSwapData: SwapData | undefined =
      tokenToSwapDataMap[token.symbol]
    const existingSwapIdx = SWAP_TYPES_ORDERED_ASC.indexOf(
      existingTokenSwapData?.type,
    )
    const newSwapIdx = SWAP_TYPES_ORDERED_ASC.indexOf(swapData.type)
    if (!existingTokenSwapData || newSwapIdx > existingSwapIdx) {
      tokenToSwapDataMap[token.symbol] = swapData
    }
  })

  return Object.values(tokenToSwapDataMap)
}

export const __test__ = {
  getTradingPairsForToken,
}
