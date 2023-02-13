import {
  MulticallCall,
  MulticallContract,
  MulticallProvider,
} from "../types/ethcall"
import {
  PoolTypes,
  SDL_WETH_SUSHI_LP_CONTRACT_ADDRESSES,
  VOTING_ESCROW_CONTRACT_ADDRESS,
} from "../constants"
import React, { ReactElement, useContext, useEffect, useState } from "react"
import { chunkedTryAll, getMulticallProvider, isSynthAsset } from "../utils"

import { BasicPoolsContext } from "./BasicPoolsProvider"
import { ChainId } from "../constants/networks"
import { Contract } from "ethcall"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "./../../types/ethers-contracts/Erc20.d"
import { GaugeContext } from "./GaugeProvider"
import { MinichefContext } from "./MinichefProvider"
import { areGaugesActive } from "../utils/gauges"
import { useActiveWeb3React } from "../hooks"

export type BasicToken = {
  address: string
  name: string
  symbol: string
  decimals: number
  isLPToken: boolean
  isSynthetic: boolean
  typeAsset: PoolTypes
  isOnTokenLists: boolean
}
export type BasicTokens = Partial<{ [address: string]: BasicToken }> | null
export const TokensContext = React.createContext<BasicTokens>(null)

export default function TokensProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const { chainId, library } = useActiveWeb3React()
  const basicPools = useContext(BasicPoolsContext)
  const minichefData = useContext(MinichefContext)
  const { gauges } = useContext(GaugeContext)
  const [tokens, setTokens] = useState<BasicTokens>(null)

  useEffect(() => {
    async function fetchTokens() {
      if (!chainId || !library || !basicPools) {
        setTokens(null)
        return
      }
      const gaugesAreActive = areGaugesActive(chainId)
      const ethCallProvider = await getMulticallProvider(library, chainId)
      const lpTokens = new Set()
      const tokenType: Partial<{ [tokenAddress: string]: PoolTypes }> = {}
      const saddleApprovedPoolTokens = new Set()
      const targetTokenAddresses = new Set(
        Object.values(basicPools)
          .map((pool) => {
            lpTokens.add(pool.lpToken)
            const tokensInPool = [
              ...pool.tokens,
              ...(pool.underlyingTokens || []),
              pool.lpToken,
            ]
            if (pool.isSaddleApproved) {
              tokensInPool.forEach((token) => {
                saddleApprovedPoolTokens.add(token)
              })
            }
            Object.assign(
              tokenType,
              ...tokensInPool.map((address) => ({
                [address]: pool.typeOfAsset,
              })),
            ) as Record<string, PoolTypes>
            return tokensInPool
          })
          .flat(),
      )
      if (minichefData) {
        // add minichef reward tokens
        minichefData.allRewardTokens.forEach((address) => {
          targetTokenAddresses.add(address)
        })
      }
      if (gauges) {
        // add gauge tokens
        Object.values(gauges).forEach((gauge) => {
          gauge.rewards.forEach(({ tokenAddress }) => {
            targetTokenAddresses.add(tokenAddress)
          })
        })
      }
      if (SDL_WETH_SUSHI_LP_CONTRACT_ADDRESSES[chainId] && gaugesAreActive) {
        // add sushi token
        targetTokenAddresses.add(
          SDL_WETH_SUSHI_LP_CONTRACT_ADDRESSES[chainId].toLowerCase(),
        )
      }
      if (VOTING_ESCROW_CONTRACT_ADDRESS[chainId] && gaugesAreActive) {
        // add voting escrow token
        targetTokenAddresses.add(
          VOTING_ESCROW_CONTRACT_ADDRESS[chainId].toLowerCase(),
        )
      }
      const tokenInfos = await getTokenInfos(
        ethCallProvider,
        chainId,
        Array.from(targetTokenAddresses),
      )
      if (!tokenInfos) return
      let tokenLists
      let tokenListsTokenAddrs: Set<string>
      try {
        const tokenListsRes = await fetch(
          "https://tokens.coingecko.com/uniswap/all.json",
        )
        tokenLists = (await tokenListsRes.json()) as {
          tokens: { address: string }[]
        }
        tokenListsTokenAddrs = new Set(
          tokenLists.tokens.map((token) => token.address.toLowerCase()),
        )
      } catch (e) {
        console.error("Error parsing token lists", e)
        tokenListsTokenAddrs = new Set()
      }
      const additionalSdlApprovedAddrsHardhat = [
        "0x9A676e781A523b5d0C0e43731313A708CB607508", // USDC
        "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1", // USDT
      ].map((addr) => addr.toLowerCase())
      const additionalSdlApprovedAddrsSet = new Set([
        ...tokenListsTokenAddrs,
        ...(ChainId.HARDHAT && additionalSdlApprovedAddrsHardhat),
      ])
      Object.keys(tokenInfos).forEach((address) => {
        ;(tokenInfos[address] as BasicToken).isLPToken = lpTokens.has(address)
        ;(tokenInfos[address] as BasicToken).typeAsset =
          tokenType[address] ?? PoolTypes.OTHER
        ;(tokenInfos[address] as BasicToken).isOnTokenLists =
          additionalSdlApprovedAddrsSet.has(String(address)) ||
          saddleApprovedPoolTokens.has(String(address))
      })
      setTokens(tokenInfos)
    }
    void fetchTokens()
  }, [chainId, library, basicPools, minichefData, gauges])
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
): Promise<BasicTokens | null> {
  if (!ethCallProvider) {
    return null
  }
  try {
    const lowercaseTokenAddresses = tokenAddresses.map((address) =>
      address.toLowerCase(),
    )
    const nameCalls = [] as MulticallCall<unknown, string>[]
    const symbolCalls = [] as MulticallCall<unknown, string>[]
    const decimalsCalls = [] as MulticallCall<unknown, number>[]
    lowercaseTokenAddresses.forEach((address) => {
      const tokenContract = new Contract(
        address,
        ERC20_ABI,
      ) as MulticallContract<Erc20>
      nameCalls.push(tokenContract.name())
      symbolCalls.push(tokenContract.symbol())
      decimalsCalls.push(tokenContract.decimals())
    })

    const [nameResults, symbolResults, decimalsResults] = await Promise.all([
      chunkedTryAll(nameCalls, ethCallProvider, 30),
      chunkedTryAll(symbolCalls, ethCallProvider, 30),
      chunkedTryAll(decimalsCalls, ethCallProvider, 30),
    ])
    const results = lowercaseTokenAddresses.reduce((acc, address, index) => {
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
