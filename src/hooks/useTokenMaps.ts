import { BasicTokensMap, TokenToPoolsMap } from "../constants"

import { BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { TokensContext } from "../providers/TokensProvider"
import { useContext } from "react"

export const useTokenMaps = (): {
  tokenAddrToTokenMap: BasicTokensMap
  tokenAddrToPoolNameMap: TokenToPoolsMap
} => {
  const basicPools = useContext(BasicPoolsContext)
  const tokens = useContext(TokensContext)

  const tokenAddrToTokenMap = Object.keys(basicPools ?? {}).reduce(
    (acc, poolName) => {
      const pool = basicPools?.[poolName]
      if (!pool) return acc
      const poolTokens = pool.tokens.map((token) => tokens?.[token]) ?? []
      const newAcc = { ...acc }
      poolTokens.forEach((token) => {
        if (!token) return
        newAcc[token.address] = token
      })
      const lpTokenAddr = tokens?.[pool.lpToken]?.address ?? ""
      const lpToken = tokens?.[pool.lpToken]
      newAcc[lpTokenAddr] = lpToken
      return newAcc
    },
    {} as BasicTokensMap,
  )

  const tokenAddrToPoolNameMap = Object.keys(basicPools ?? {}).reduce(
    (acc, poolName) => {
      const pool = basicPools?.[poolName]
      if (!pool) return acc
      const poolTokens = pool.tokens.map((token) => tokens?.[token]) ?? []
      const newAcc = { ...acc }
      poolTokens.forEach((token) => {
        if (!token) return
        newAcc[token.address] = (newAcc[token.address] || []).concat(
          poolName as string,
        )
      })
      return newAcc
    },
    {} as TokenToPoolsMap,
  )

  return { tokenAddrToTokenMap, tokenAddrToPoolNameMap }
}
