import { ChainId } from "../constants/networks"
import { useCallback } from "react"
import { useQuery } from "@tanstack/react-query"

const swapStatsURI = "https://ipfs.saddle.exchange/swap-stats.json"

type PoolStats = {
  oneDayVolume: string
  apy: string
  tvl: string
  utilization: string
}
type SwapStats = {
  [chainId in ChainId]?: Partial<{
    [swapAddress: string]: PoolStats
  }>
}

type SwapStatsReponse = {
  [chainId in ChainId]?: {
    [swapAddress: string]: {
      oneDayVolume: number
      APY: number
      TVL: number
    }
  }
}
export function useSwapStats() {
  return useQuery(
    ["swapStats"],
    async () => {
      const res = await fetch(`${swapStatsURI}`)
      if (res.status >= 200 && res.status < 300) {
        return res.json()
      }
      throw new Error("Unable to fetch swap stats from IPFS")
    },
    {
      select: useCallback(
        (data: SwapStatsReponse) => formatSwapStats(data),
        [],
      ),
      retry: 3,
      refetchInterval: 60 * 60 * 1000, // 1hr
      refetchOnMount: false,
      staleTime: 60 * 60 * 1000, // 1hr
    },
  )
}

const formatSwapStats = (swapStats: SwapStatsReponse) => {
  const formattedPayload = Object.keys(swapStats).reduce(
    (chainsAcc, chainId) => {
      const chainData = swapStats[chainId] as NonNullable<
        SwapStatsReponse[ChainId]
      >
      const processedChainData = Object.keys(chainData).reduce(
        (poolsAcc, poolAddress) => {
          const { APY, TVL, oneDayVolume: ODV } = chainData[poolAddress]
          if (isNaN(APY) || isNaN(TVL) || isNaN(ODV)) {
            return poolsAcc
          }
          const apy = APY.toFixed(18)
          const tvl = TVL.toFixed(18)
          const oneDayVolume = ODV.toFixed(18)
          const utilization = (TVL > 0 ? ODV / TVL : 0).toFixed(18)
          return {
            ...poolsAcc,
            [(poolAddress as string).toLowerCase()]: {
              apy,
              tvl,
              oneDayVolume,
              utilization,
            },
          }
        },
        {},
      )
      return {
        ...chainsAcc,
        [chainId]: processedChainData,
      }
    },
    {},
  )
  return formattedPayload as SwapStats
}
