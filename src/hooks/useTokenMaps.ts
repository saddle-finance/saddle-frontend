import { BasicTokensMap, PoolName, TokenToPoolsMap } from "../constants"

import { BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { TokensContext } from "../providers/TokensProvider"
import { useContext } from "react"

export const useTokenMaps = (): {
  tokensMap: BasicTokensMap
  tokenToPoolsMap: TokenToPoolsMap
} => {
  const basicPools = useContext(BasicPoolsContext)
  const tokens = useContext(TokensContext)

  const tokensMap = Object.keys(basicPools ?? {}).reduce((acc, poolName) => {
    const pool = basicPools?.[poolName as PoolName]
    const poolTokens = pool?.tokens.map((token) => tokens?.[token]) ?? []
    const newAcc = { ...acc }
    poolTokens.forEach((token) => {
      newAcc[token?.symbol ?? ""] = token
    })
    const lpTokenSymbol = tokens?.[pool?.lpToken ?? ""]?.symbol ?? ""
    const lpToken = tokens?.[pool?.lpToken ?? ""]
    newAcc[lpTokenSymbol] = lpToken
    return newAcc
  }, {} as BasicTokensMap)

  const tokenToPoolsMap = Object.keys(basicPools ?? {}).reduce(
    (acc, poolName) => {
      const pool = basicPools?.[poolName]
      const poolTokens = pool?.tokens.map((token) => tokens?.[token]) ?? []
      const newAcc = { ...acc }
      poolTokens.forEach((token) => {
        newAcc[token?.symbol ?? ""] = (
          newAcc[token?.symbol ?? ""] || []
        ).concat(poolName as PoolName)
      })
      return newAcc
    },
    {} as TokenToPoolsMap,
  )

  return { tokensMap, tokenToPoolsMap }
}
