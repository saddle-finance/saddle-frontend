import { ExpandedBasicPool, __test__ } from "../useCalculateSwapPairs"
import { PoolTypes, SWAP_TYPES } from "../../constants/index"

import { BasicToken } from "./../../providers/TokensProvider"
import { BigNumber } from "@ethersproject/bignumber"
import { getPriceDataForPool } from "../../utils"

const { getTradingPairsForToken } = __test__

const createTestToken = (name: string, isSynth?: boolean): BasicToken => {
  return {
    name,
    symbol: name,
    address: `0x${name.toLowerCase()}`, // shut up it's test data!
    decimals: 18,
    isSynthetic: isSynth || false,
    isLPToken: false,
    isOnTokenLists: true,
    typeAsset: 1,
  }
}

const createTestPool = (
  poolName: string,
  tokens: BasicToken[],
  isMetaSwap: boolean,
  typeOfAsset = PoolTypes.USD,
) => {
  return {
    poolName,
    lpToken: `0xlp-${poolName}`,
    tokens: tokens.map((token) => token.address),
    expandedTokens: tokens,
    expandedUnderlyingTokens: isMetaSwap ? tokens : null,
    isSynthetic: tokens.some(({ isSynthetic }) => isSynthetic),
    poolAddress: `0x${poolName}`,
    typeOfAsset,
    targetAddress: null,
    isSaddleApproved: true,
    isRemoved: false,
    isGuarded: false,
    isPaused: false,
    isMigrated: false,
    virtualPrice: BigNumber.from(1),
    adminFee: BigNumber.from(1),
    swapFee: BigNumber.from(1),
    aParameter: BigNumber.from(1),
    tokenBalances: tokens.map(() => BigNumber.from(1)),
    lpTokenSupply: BigNumber.from(1),
    miniChefRewardsPid: null,
    underlyingTokens: isMetaSwap ? tokens.map((token) => token.address) : null,
    basePoolAddress: isMetaSwap ? `0xbase-${poolName}` : null,
    metaSwapDepositAddress: isMetaSwap ? `0xdeposit-${poolName}` : null,
    underlyingTokenBalances: isMetaSwap
      ? tokens.map(() => BigNumber.from(1))
      : null,
    isMetaSwap,
    priceData: {} as ReturnType<typeof getPriceDataForPool>,
  } as ExpandedBasicPool
}
describe("getTradingPairsForToken", () => {
  const tokenA = createTestToken("tokenA")
  const tokenB = createTestToken("tokenB")
  const tokenC = createTestToken("tokenC")
  const tokenD = createTestToken("tokenD")
  const tokenE = createTestToken("tokenESynth", true)
  const tokenF = createTestToken("tokenFSynth", true)
  const tokenG = createTestToken("tokenG")

  const pool1 = createTestPool("NonSynth AB", [tokenA, tokenB], false)
  const pool2 = createTestPool("Synth CDE", [tokenC, tokenD, tokenE], false)
  const pool3 = createTestPool("Synth DFG", [tokenD, tokenF, tokenG], true)

  const allTokens = [tokenA, tokenB, tokenC, tokenD, tokenE, tokenF, tokenG]
  const allPools = [pool1, pool2, pool3]

  const tokensMap = allTokens.reduce(
    (acc, t) => ({ ...acc, [t.address.toLowerCase()]: t }),
    {} as { [address: string]: BasicToken },
  )

  const tokensToPoolsMap = {
    [tokenA.address]: [pool1.poolName],
    [tokenB.address]: [pool1.poolName],
    [tokenC.address]: [pool2.poolName],
    [tokenD.address]: [pool2.poolName, pool3.poolName],
    [tokenE.address]: [pool2.poolName],
    [tokenF.address]: [pool3.poolName],
    [tokenG.address]: [pool3.poolName],
  }

  it("Tokens can't swap with themselves", () => {
    const pairs = getTradingPairsForToken(
      tokensMap,
      allPools,
      tokensToPoolsMap,
      tokenA,
      true,
    )
    const selfPair = pairs.find(
      (swapData) => swapData.from.symbol === swapData.to.symbol,
    )
    expect(selfPair).toEqual({
      type: SWAP_TYPES.INVALID,
      from: {
        address: "0xtokena",
        symbol: tokenA.symbol,
        poolName: undefined,
        tokenIndex: -1,
      },
      to: {
        address: "0xtokena",
        symbol: tokenA.symbol,
        poolName: undefined,
        tokenIndex: -1,
      },
      route: [],
    })
  })

  it("Tokens in non-synth pools can only swap with each other", () => {
    const pairs = getTradingPairsForToken(
      tokensMap,
      allPools,
      tokensToPoolsMap,
      tokenA,
      true,
    )
    expect(pairs).toContainEqual({
      type: SWAP_TYPES.DIRECT,
      from: {
        address: "0xtokena",
        symbol: tokenA.symbol,
        poolName: pool1.poolName,
        tokenIndex: pool1.tokens.indexOf(tokenA.address),
      },
      to: {
        address: "0xtokenb",
        symbol: tokenB.symbol,
        poolName: pool1.poolName,
        tokenIndex: pool1.tokens.indexOf(tokenB.address),
      },
      route: [tokenA.symbol, tokenB.symbol],
    })
    for (const swapData of pairs) {
      const { type, to } = swapData
      if (to.poolName !== pool1.poolName) {
        expect(type).toEqual(SWAP_TYPES.INVALID)
      }
    }
  })

  it("Synth tokens can swap with any other synth token", () => {
    const pairs = getTradingPairsForToken(
      tokensMap,
      allPools,
      tokensToPoolsMap,
      tokenE,
      true,
    )
    expect(tokenE.isSynthetic).toBeTruthy()
    expect(tokenF.isSynthetic).toBeTruthy()
    expect(pairs).toContainEqual({
      type: SWAP_TYPES.SYNTH_TO_SYNTH,
      from: {
        address: "0xtokenesynth",
        symbol: tokenE.symbol,
        poolName: pool2.poolName,
        tokenIndex: pool2.tokens.indexOf(tokenE.address),
      },
      to: {
        address: "0xtokenfsynth",
        symbol: tokenF.symbol,
        poolName: pool3.poolName,
        tokenIndex: pool3.tokens.indexOf(tokenF.address),
      },
      route: [tokenE.symbol, tokenF.symbol],
    })
  })

  it("Virtual swaps can be disabled", () => {
    const pairs = getTradingPairsForToken(
      tokensMap,
      allPools,
      tokensToPoolsMap,
      tokenE,
      false,
    )
    expect(tokenE.isSynthetic).toBeTruthy()
    expect(tokenF.isSynthetic).toBeTruthy()
    expect(pairs).toContainEqual({
      type: SWAP_TYPES.INVALID,
      from: {
        address: "0xtokenesynth",
        symbol: tokenE.symbol,
        poolName: undefined,
        tokenIndex: -1,
      },
      to: {
        address: "0xtokenfsynth",
        symbol: tokenF.symbol,
        poolName: undefined,
        tokenIndex: -1,
      },
      route: [],
    })
  })

  it("A synth token can swap with a nonSynth token in a synth pool", () => {
    const pairs = getTradingPairsForToken(
      tokensMap,
      allPools,
      tokensToPoolsMap,
      tokenF,
      true,
    )
    expect(tokenF.isSynthetic).toBeTruthy()
    expect(tokenC.isSynthetic).toBeFalsy()
    expect(pairs).toContainEqual({
      type: SWAP_TYPES.SYNTH_TO_TOKEN,
      from: {
        address: "0xtokenfsynth",
        symbol: tokenF.symbol,
        poolName: pool3.poolName,
        tokenIndex: pool3.tokens.indexOf(tokenF.address),
      },
      to: {
        address: "0xtokenc",
        symbol: tokenC.symbol,
        poolName: pool2.poolName,
        tokenIndex: pool2.tokens.indexOf(tokenC.address),
      },
      route: [tokenF.symbol, tokenE.symbol, tokenC.symbol],
    })
  })

  it("A nonSynth token in a synth pool can swap with another nonSynth token in a different synth pool", () => {
    const pairs = getTradingPairsForToken(
      tokensMap,
      allPools,
      tokensToPoolsMap,
      tokenC,
      true,
    )
    expect(tokenC.isSynthetic).toBeFalsy()
    expect(tokenG.isSynthetic).toBeFalsy()
    expect(pairs).toContainEqual({
      type: SWAP_TYPES.TOKEN_TO_TOKEN,
      from: {
        address: "0xtokenc",
        symbol: tokenC.symbol,
        poolName: pool2.poolName,
        tokenIndex: pool2.tokens.indexOf(tokenC.address),
      },
      to: {
        address: "0xtokeng",
        symbol: tokenG.symbol,
        poolName: pool3.poolName,
        tokenIndex: pool3.tokens.indexOf(tokenG.address),
      },
      route: [tokenC.symbol, tokenE.symbol, tokenF.symbol, tokenG.symbol],
    })
  })

  it("A nonSynth token in a synth pool can swap with a synth token in another pool", () => {
    const pairs = getTradingPairsForToken(
      tokensMap,
      allPools,
      tokensToPoolsMap,
      tokenC,
      true,
    )
    expect(tokenC.isSynthetic).toBeFalsy()
    expect(tokenF.isSynthetic).toBeTruthy()
    expect(pairs).toContainEqual({
      type: SWAP_TYPES.TOKEN_TO_SYNTH,
      from: {
        address: "0xtokenc",
        symbol: tokenC.symbol,
        poolName: pool2.poolName,
        tokenIndex: pool2.tokens.indexOf(tokenC.address),
      },
      to: {
        address: "0xtokenfsynth",
        symbol: tokenF.symbol,
        poolName: pool3.poolName,
        tokenIndex: pool3.tokens.indexOf(tokenF.address),
      },
      route: [tokenC.symbol, tokenE.symbol, tokenF.symbol],
    })
  })
})
