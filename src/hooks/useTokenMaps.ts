import { BasicTokensMap, TokenToPoolsMap } from "../constants"

import { BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { TokensContext } from "../providers/TokensProvider"
import { useContext } from "react"

export const useTokenMaps = (): {
  tokenSymbolToTokenMap: BasicTokensMap
  tokenSymbolToPoolNameMap: TokenToPoolsMap
} => {
  const basicPools = useContext(BasicPoolsContext)
  const tokens = useContext(TokensContext)

  const tokenSymbolToTokenMap = Object.keys(basicPools ?? {}).reduce(
    (acc, poolName) => {
      const pool = basicPools?.[poolName]
      if (!pool) return acc
      const poolTokens = pool.tokens.map((token) => tokens?.[token]) ?? []
      const newAcc = { ...acc }
      poolTokens.forEach((token) => {
        if (!token) return
        newAcc[token.symbol] = token
      })
      const lpTokenSymbol = tokens?.[pool.lpToken]?.symbol ?? ""
      const lpToken = tokens?.[pool.lpToken]
      newAcc[lpTokenSymbol] = lpToken
      return newAcc
    },
    {} as BasicTokensMap,
  )

  const tokenSymbolToPoolNameMap = Object.keys(basicPools ?? {}).reduce(
    (acc, poolName) => {
      const pool = basicPools?.[poolName]
      if (!pool) return acc
      const poolTokens = pool.tokens.map((token) => tokens?.[token]) ?? []
      const newAcc = { ...acc }
      poolTokens.forEach((token) => {
        if (!token) return
        newAcc[token.symbol] = (newAcc[token.symbol] || []).concat(
          poolName as string,
        )
      })
      return newAcc
    },
    {} as TokenToPoolsMap,
  )

  return { tokenSymbolToTokenMap, tokenSymbolToPoolNameMap }
}
