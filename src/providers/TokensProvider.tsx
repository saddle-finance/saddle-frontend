import {
  MulticallCall,
  MulticallContract,
  MulticallProvider,
} from "../types/ethcall"
import React, { ReactElement, useContext, useEffect, useState } from "react"
import { getMulticallProvider, isSynthAsset } from "../utils"

import { BasicPoolsContext } from "./BasicPoolsProvider"
import { ChainId } from "../constants"
import { Contract } from "ethcall"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "./../../types/ethers-contracts/Erc20.d"
import { useActiveWeb3React } from "../hooks"

type Token = {
  address: string
  name: string
  symbol: string
  decimals: number
  isLPToken: boolean
  isSynthetic: boolean
}
type Tokens = Record<string, Token> | null
export const TokensContext = React.createContext<Tokens>(null)

export default function TokensProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const { chainId, library } = useActiveWeb3React()
  const pools = useContext(BasicPoolsContext)
  const [tokens, setTokens] = useState<Tokens>(null)
  useEffect(() => {
    async function fetchTokens() {
      if (!chainId || !library || !pools) {
        setTokens(null)
        return
      }
      const ethCallProvider = await getMulticallProvider(library, chainId)
      const lpTokens = new Set()
      const targetTokenAddresses = new Set(
        Object.values(pools)
          .map((pool) => {
            lpTokens.add(pool.lpToken)
            return [
              ...pool.tokens,
              ...(pool.underlyingTokens || []),
              pool.lpToken,
            ]
          })
          .flat(),
      )
      const tokenInfos = await getTokenInfos(
        ethCallProvider,
        chainId,
        Array.from(targetTokenAddresses),
      )
      if (!tokenInfos) return
      Object.keys(tokenInfos).forEach((address) => {
        tokenInfos[address].isLPToken = lpTokens.has(address)
      })
      setTokens(tokenInfos)
    }
    void fetchTokens()
  }, [chainId, library, pools])
  return (
    <TokensContext.Provider value={tokens}>{children}</TokensContext.Provider>
  )
}

/**
 * Fetch basic information about a set of tokens
 * Does not fetch any user balances
 */
async function getTokenInfos(
  ethCallProvider: MulticallProvider,
  chainId: ChainId,
  tokenAddresses: string[], // we assume these are already deduped
): Promise<Tokens | null> {
  if (!ethCallProvider) {
    return null
  }
  try {
    const nameCalls = [] as MulticallCall<unknown, string>[]
    const symbolCalls = [] as MulticallCall<unknown, string>[]
    const decimalsCalls = [] as MulticallCall<unknown, number>[]
    tokenAddresses.forEach((address) => {
      const tokenContract = new Contract(
        address,
        ERC20_ABI,
      ) as MulticallContract<Erc20>
      nameCalls.push(tokenContract.name())
      symbolCalls.push(tokenContract.symbol())
      decimalsCalls.push(tokenContract.decimals())
    })
    const multicallArgs = Array(tokenAddresses.length).fill(true)

    const [nameResults, symbolResults, decimalsResults] = await Promise.all([
      ethCallProvider.tryEach(nameCalls, multicallArgs),
      ethCallProvider.tryEach(symbolCalls, multicallArgs),
      ethCallProvider.tryEach(decimalsCalls, multicallArgs),
    ])
    const results = tokenAddresses.reduce((acc, address, index) => {
      const name = nameResults[index]
      const symbol = symbolResults[index]
      const decimals = decimalsResults[index] // could be 0
      if (name && symbol && decimals != null) {
        const isSynthetic = isSynthAsset(chainId, address)
        const token = {
          address,
          name,
          symbol,
          decimals,
          isSynthetic,
        }
        return {
          ...acc,
          [address]: token,
        }
      }
      return acc
    }, {})
    return results
  } catch (e) {
    const error = e as Error
    error.message = `Error fetching token infos: ${error.message}`
    console.error(error)
    return null
  }
}
