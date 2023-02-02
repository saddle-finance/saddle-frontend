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
import { UseQueryResult, useQuery } from "@tanstack/react-query"
import { chunkedTryAll, isSynthAsset } from "../utils"

import { BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { ChainId } from "../constants/networks"
import { Contract } from "ethcall"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "./../../types/ethers-contracts/Erc20.d"
import { GaugeContext } from "../providers/GaugeProvider"
import { MinichefContext } from "../providers/MinichefProvider"
import { areGaugesActive } from "../utils/gauges"
import { useActiveWeb3React } from "../hooks"
import { useContext } from "react"
import { useMulticallProvider } from "./useMulticallProvider"

export type BasicToken = {
  address: string
  name: string
  symbol: string
  decimals: number
  isLPToken: boolean
  isSynthetic: boolean
  typeAsset: PoolTypes
}
export type BasicTokens = Partial<{ [address: string]: BasicToken }> | null

export const useBasicTokens = (): UseQueryResult<BasicTokens> => {
  const { chainId } = useActiveWeb3React()
  const basicPools = useContext(BasicPoolsContext)
  const minichefData = useContext(MinichefContext)
  const { gauges } = useContext(GaugeContext)
  const { data: ethCallProvider } = useMulticallProvider()
  const gaugesAreActive = areGaugesActive(chainId)
  const lpTokens = new Set()
  const tokenType: Partial<{ [tokenAddress: string]: PoolTypes }> = {}

  return useQuery(["tokens"], async () => {
    if (!chainId || !basicPools || !ethCallProvider) {
      return null
    }
    const pools = Object.values(basicPools)
    const targetTokens: string[][] = []
    pools.forEach((pool) => {
      lpTokens.add(pool.lpToken)
      const tokensInPool = [
        ...pool.tokens,
        ...(pool.underlyingTokens || []),
        pool.lpToken,
      ]
      Object.assign(
        tokenType,
        ...tokensInPool.map((address) => ({
          [address]: pool.typeOfAsset,
        })),
      ) as Record<string, PoolTypes>
      targetTokens.push(tokensInPool)
    })
    const targetTokensFlattened = [...targetTokens].flat()
    const targetTokenAddresses = new Set(targetTokensFlattened)
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
    Object.keys(tokenInfos).forEach((address) => {
      ;(tokenInfos[address] as BasicToken).isLPToken = lpTokens.has(address)
      ;(tokenInfos[address] as BasicToken).typeAsset =
        tokenType[address] ?? PoolTypes.OTHER
    })
    return tokenInfos
  })
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
