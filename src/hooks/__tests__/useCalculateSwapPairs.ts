import {
  ChainId,
  Pool,
  PoolName,
  PoolTypes,
  SWAP_TYPES,
  Token,
} from "../../constants/index"

import { __test__ } from "../useCalculateSwapPairs"

const { getTradingPairsForToken } = __test__

const chainObject = Object.keys(ChainId)
  .filter((k) => parseInt(k) > 0)
  .reduce(
    (acc, chainId) => ({
      ...acc,
      [chainId]: "",
    }),
    {} as { [chainId in ChainId]: string },
  )

const createTestToken = (name: string, isSynth?: boolean) => {
  return new Token(chainObject, 0, name, "", name, "", !!isSynth)
}

const createTestPool = (
  name: string,
  tokens: Token[],
  type = PoolTypes.USD,
): Pool => {
  return {
    name: name as PoolName, // not true but it's a test
    lpToken: createTestToken(`${name} LPToken`),
    poolTokens: tokens,
    isSynthetic: tokens.some(({ isSynthetic }) => isSynthetic),
    addresses: {} as { [chainId in ChainId]: string },
    type,
    route: "",
  }
}
describe("getTradingPairsForToken", () => {
  const tokenA = createTestToken("tokenA")
  const tokenB = createTestToken("tokenB")
  const tokenC = createTestToken("tokenC")
  const tokenD = createTestToken("tokenD")
  const tokenE = createTestToken("tokenESynth", true)
  const tokenF = createTestToken("tokenFSynth", true)
  const tokenG = createTestToken("tokenG")

  const pool1 = createTestPool("NonSynth AB", [tokenA, tokenB])
  const pool2 = createTestPool("Synth CDE", [tokenC, tokenD, tokenE])
  const pool3 = createTestPool("Synth DFG", [tokenD, tokenF, tokenG])

  const allTokens = [tokenA, tokenB, tokenC, tokenD, tokenE, tokenF, tokenG]
  const allPools = [pool1, pool2, pool3]

  const tokensMap = allTokens.reduce(
    (acc, t) => ({ ...acc, [t.symbol]: t }),
    {} as { [symbol: string]: Token },
  )
  const poolsMap = allPools.reduce(
    (acc, p) => ({ ...acc, [p.name]: p }),
    {} as { [poolName: string]: Pool },
  )
  const tokensToPoolsMap = {
    [tokenA.symbol]: [pool1.name],
    [tokenB.symbol]: [pool1.name],
    [tokenC.symbol]: [pool2.name],
    [tokenD.symbol]: [pool2.name, pool3.name],
    [tokenE.symbol]: [pool2.name],
    [tokenF.symbol]: [pool3.name],
    [tokenG.symbol]: [pool3.name],
  }
  it("Tokens can't swap with themselves", () => {
    const pairs = getTradingPairsForToken(
      tokensMap,
      poolsMap,
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
        symbol: tokenA.symbol,
        poolName: undefined,
        tokenIndex: undefined,
      },
      to: {
        symbol: tokenA.symbol,
        poolName: undefined,
        tokenIndex: undefined,
      },
      route: [],
    })
  })

  it("Tokens in non-synth pools can only swap with each other", () => {
    const pairs = getTradingPairsForToken(
      tokensMap,
      poolsMap,
      allPools,
      tokensToPoolsMap,
      tokenA,
      true,
    )
    expect(pairs).toContainEqual({
      type: SWAP_TYPES.DIRECT,
      from: {
        symbol: tokenA.symbol,
        poolName: pool1.name,
        tokenIndex: pool1.poolTokens.indexOf(tokenA),
      },
      to: {
        symbol: tokenB.symbol,
        poolName: pool1.name,
        tokenIndex: pool1.poolTokens.indexOf(tokenB),
      },
      route: [tokenA.symbol, tokenB.symbol],
    })
    for (const swapData of pairs) {
      const { type, to } = swapData
      if (to.poolName !== pool1.name) {
        expect(type).toEqual(SWAP_TYPES.INVALID)
      }
    }
  })

  it("Synth tokens can swap with any other synth token", () => {
    const pairs = getTradingPairsForToken(
      tokensMap,
      poolsMap,
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
        symbol: tokenE.symbol,
        poolName: pool2.name,
        tokenIndex: pool2.poolTokens.indexOf(tokenE),
      },
      to: {
        symbol: tokenF.symbol,
        poolName: pool3.name,
        tokenIndex: pool3.poolTokens.indexOf(tokenF),
      },
      route: [tokenE.symbol, tokenF.symbol],
    })
  })

  it("Virtual swaps can be disabled", () => {
    const pairs = getTradingPairsForToken(
      tokensMap,
      poolsMap,
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
        symbol: tokenE.symbol,
        poolName: undefined,
        tokenIndex: undefined,
      },
      to: {
        symbol: tokenF.symbol,
        poolName: undefined,
        tokenIndex: undefined,
      },
      route: [],
    })
  })

  it("A synth token can swap with a nonSynth token in a synth pool", () => {
    const pairs = getTradingPairsForToken(
      tokensMap,
      poolsMap,
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
        symbol: tokenF.symbol,
        poolName: pool3.name,
        tokenIndex: pool3.poolTokens.indexOf(tokenF),
      },
      to: {
        symbol: tokenC.symbol,
        poolName: pool2.name,
        tokenIndex: pool2.poolTokens.indexOf(tokenC),
      },
      route: [tokenF.symbol, tokenE.symbol, tokenC.symbol],
    })
  })

  it("A nonSynth token in a synth pool can swap with another nonSynth token in a different synth pool", () => {
    const pairs = getTradingPairsForToken(
      tokensMap,
      poolsMap,
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
        symbol: tokenC.symbol,
        poolName: pool2.name,
        tokenIndex: pool2.poolTokens.indexOf(tokenC),
      },
      to: {
        symbol: tokenG.symbol,
        poolName: pool3.name,
        tokenIndex: pool3.poolTokens.indexOf(tokenG),
      },
      route: [tokenC.symbol, tokenE.symbol, tokenF.symbol, tokenG.symbol],
    })
  })

  it("A nonSynth token in a synth pool can swap with a synth token in another pool", () => {
    const pairs = getTradingPairsForToken(
      tokensMap,
      poolsMap,
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
        symbol: tokenC.symbol,
        poolName: pool2.name,
        tokenIndex: pool2.poolTokens.indexOf(tokenC),
      },
      to: {
        symbol: tokenF.symbol,
        poolName: pool3.name,
        tokenIndex: pool3.poolTokens.indexOf(tokenF),
      },
      route: [tokenC.symbol, tokenE.symbol, tokenF.symbol],
    })
  })
})
