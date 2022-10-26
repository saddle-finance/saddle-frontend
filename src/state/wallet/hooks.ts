import { useContext, useMemo } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import { TokensContext } from "../../providers/TokensProvider"
import { UserStateContext } from "../../providers/UserStateProvider"

export function usePoolTokenBalances(): { [token: string]: BigNumber } | null {
  // DEPRECATED
  const userState = useContext(UserStateContext)
  const tokens = useContext(TokensContext)
  return useMemo(() => {
    if (!userState?.tokenBalances || !tokens) return null
    return (Object.keys(userState?.tokenBalances ?? {}) as string[]).reduce(
      (acc, tokenAddress) => {
        const token = tokens[tokenAddress]
        const balance = userState.tokenBalances?.[tokenAddress]
        if (!token || !balance) return acc
        return { ...acc, [token.address]: balance }
      },
      {},
    )
  }, [tokens, userState?.tokenBalances])
}
