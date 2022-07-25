import { BasicPool, BasicPoolsContext } from "./BasicPoolsProvider"
import { BasicToken, TokensContext } from "./TokensProvider"
import {
  EMPTY_LOADABLE,
  LoadableType,
  useLoadingState,
} from "../utils/loadable"
import React, { ReactElement, useContext, useEffect } from "react"

export type ExpandedPool = Omit<
  BasicPool,
  "tokens" | "underlyingTokens" | "lpToken"
> & {
  tokens: BasicToken[]
  underlyingTokens: BasicToken[] | null
  lpToken: BasicToken
}
export type ExpandedPoolsMap = Partial<Record<string, ExpandedPool>>
export type ExpandedPoolsMapByKeys = {
  byName: ExpandedPoolsMap
  byAddress: ExpandedPoolsMap
}
export type ExpandedPools = LoadableType<ExpandedPoolsMapByKeys>

export const ExpandedPoolsContext = React.createContext<ExpandedPools>({
  ...EMPTY_LOADABLE,
  data: { byName: {}, byAddress: {} },
})

export default function ExpandedPoolsProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const basicPools = useContext(BasicPoolsContext)
  const tokens = useContext(TokensContext)
  const { state, onStart, onSuccess } = useLoadingState<ExpandedPoolsMapByKeys>(
    {
      byName: {},
      byAddress: {},
    },
  )

  useEffect(() => {
    onStart()
  }, [onStart])

  useEffect(() => {
    const errorPools: string[] = []
    const errorTokensAll: string[] = []
    if (basicPools && tokens) {
      const result = Object.values(basicPools || {}).reduce(
        (acc, basicPool) => {
          const errorTokens: string[] = []
          // Tokens
          const expandedPoolTokens = basicPool.tokens.map((tokenAddr) => {
            const token = tokens[tokenAddr]
            if (!token) {
              errorTokens.push(tokenAddr)
            }
            return token
          }) as BasicToken[]
          // Underlying Tokens
          const expandedUnderlyingPoolTokens = basicPool.isMetaSwap
            ? (basicPool.underlyingTokens.map((tokenAddr) => {
                const token = tokens[tokenAddr]
                if (!token) {
                  errorTokens.push(tokenAddr)
                }
                return token
              }) as BasicToken[])
            : null
          // LP Token
          const expandedLpToken = tokens[basicPool.lpToken]
          if (!expandedLpToken) {
            errorTokens.push(basicPool.lpToken)
          }

          // If any tokens aren't found, invalidate the whole pool
          if (errorTokens.length > 0) {
            errorTokensAll.concat(errorTokens)
            errorPools.push(basicPool.poolName)
            return acc
          }
          const expandedPool = {
            ...basicPool,
            tokens: expandedPoolTokens,
            underlyingTokens: expandedUnderlyingPoolTokens,
            lpToken: expandedLpToken,
          } as ExpandedPool
          return {
            byName: {
              ...acc.byName,
              [basicPool.poolName]: expandedPool,
            },
            byAddress: {
              ...acc.byAddress,
              [basicPool.poolAddress]: expandedPool,
            },
          }
        },
        { byName: {}, byAddress: {} },
      )

      if (errorTokensAll.length > 0) {
        const tokensString = [...new Set(errorTokensAll.values())].join(", ")
        const poolsString = [...new Set(errorPools.values())].join(", ")
        console.error(
          `Error loading tokens [${tokensString}] in pools [${poolsString}]`,
        )
      }

      onSuccess(result)
    }
  }, [basicPools, onSuccess, tokens])

  return (
    <ExpandedPoolsContext.Provider value={state}>
      {children}
    </ExpandedPoolsContext.Provider>
  )
}
