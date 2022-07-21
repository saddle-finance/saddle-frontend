import { BasicPool, BasicPoolsContext } from "./BasicPoolsProvider"
import { BasicToken, TokensContext } from "./TokensProvider"
import {
  EMPTY_LOADABLE,
  LoadableType,
  useLoadingState,
} from "../utils/loadable"
import React, { ReactElement, useContext } from "react"

export type ExpandedPool = Omit<
  BasicPool,
  "tokens" | "underlyingTokens" | "lpToken"
> & {
  tokens: BasicToken[]
  underlyingTokens: BasicToken[] | null
  lpToken: BasicToken
}
export type ExpandedPoolsMap = Partial<Record<string, ExpandedPool>>
export type ExpandedPools = LoadableType<ExpandedPoolsMap>
const defaultState = {
  ...EMPTY_LOADABLE,
  data: {},
}
export const ExpandedPoolsContext =
  React.createContext<ExpandedPools>(defaultState)

export default function ExpandedPoolsProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const basicPools = useContext(BasicPoolsContext)
  const tokens = useContext(TokensContext)
  const { state, onStart, onSuccess } = useLoadingState<ExpandedPoolsMap>({})
  void onStart()

  const errorPools = new Set<string>()
  let errorTokensAll = new Set<string>()

  if (basicPools && tokens) {
    const result = Object.values(basicPools || {}).reduce((acc, basicPool) => {
      const errorTokens = new Set<string>()
      // Tokens
      const expandedPoolTokens = basicPool.tokens.map((tokenAddr) => {
        const token = tokens[tokenAddr]
        if (!token) {
          errorTokens.add(tokenAddr)
        }
        return token
      }) as BasicToken[]
      // Underlying Tokens
      const expandedUnderlyingPoolTokens = basicPool.isMetaSwap
        ? (basicPool.underlyingTokens.map((tokenAddr) => {
            const token = tokens[tokenAddr]
            if (!token) {
              errorTokens.add(tokenAddr)
            }
            return token
          }) as BasicToken[])
        : null
      // LP Token
      const expandedLpToken = tokens[basicPool.lpToken]
      if (!expandedLpToken) {
        errorTokens.add(basicPool.lpToken)
      }

      // If any tokens aren't found, invalidate the whole pool
      if (errorTokens.size > 0) {
        errorTokensAll = new Set<string>([...errorTokensAll, ...errorTokens])
        errorPools.add(basicPool.poolName)
        return acc
      }

      return {
        ...acc,
        [basicPool.poolName]: {
          ...basicPool,
          tokens: expandedPoolTokens,
          underlyingTokens: expandedUnderlyingPoolTokens,
          lpToken: expandedLpToken,
        } as ExpandedPool,
      }
    }, {} as ExpandedPoolsMap)

    if (errorTokensAll.size > 0) {
      const tokensString = [...errorTokensAll.values()].join(", ")
      const poolsString = [...errorPools.values()].join(", ")
      console.error(
        `Error loading tokens [${tokensString}] in pools [${poolsString}]`,
      )
    }

    onSuccess(result)
  }

  return (
    <ExpandedPoolsContext.Provider value={state}>
      {children}
    </ExpandedPoolsContext.Provider>
  )
}
