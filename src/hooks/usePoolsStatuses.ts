import { POOLS_MAP, PoolName, PoolTypes } from "../constants"
import { useEffect, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { Contract } from "ethcall"
import LPTOKEN_UNGUARDED_ABI from "../constants/abis/lpTokenUnguarded.json"
import { LpTokenUnguarded } from "../../types/ethers-contracts/LpTokenUnguarded"
import { MulticallContract } from "../types/ethcall"
import SWAP_FLASH_LOAN_ABI from "../constants/abis/swapFlashLoan.json"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { getMulticallProvider } from "../utils"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "."
import { useSelector } from "react-redux"

type PoolStatuses = {
  [poolName in PoolName]?: {
    tvl: BigNumber
    isPaused: boolean
  }
}
export default function usePoolStatuses(): PoolStatuses {
  const { chainId, library } = useActiveWeb3React()
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  const [poolStatuses, setPoolStatuses] = useState<PoolStatuses>({})

  useEffect(() => {
    if (
      Object.keys(poolStatuses).length > 0 && // only run once
      tokenPricesUSD?.BTC &&
      tokenPricesUSD?.ETH
    )
      return
    async function fetchStatuses() {
      if (!library || !chainId) return
      const ethcallProvider = await getMulticallProvider(library, chainId)

      const pools = Object.values(POOLS_MAP).filter(
        ({ addresses }) => addresses[chainId],
      )
      const supplyCalls = pools
        .map((p) => {
          return new Contract(
            p.lpToken.addresses[chainId],
            LPTOKEN_UNGUARDED_ABI,
          ) as MulticallContract<LpTokenUnguarded>
        })
        .map((c) => c.totalSupply())
      const pausedCalls = pools
        .map((p) => {
          return new Contract(
            p.metaSwapAddresses?.[chainId] || p.addresses[chainId],
            SWAP_FLASH_LOAN_ABI,
          ) as MulticallContract<SwapFlashLoan>
        })
        .map((c) => c.paused())
      try {
        const tvls = await ethcallProvider.all(supplyCalls, {})
        const pausedStatuses = await ethcallProvider.all(pausedCalls, {})
        const tvlsUSD = pools.map((pool, i) => {
          const tvlAmount = tvls[i]
          let tokenValue = 0
          if (pool.type === PoolTypes.BTC) {
            tokenValue = tokenPricesUSD?.BTC || 0
          } else if (pool.type === PoolTypes.ETH) {
            tokenValue = tokenPricesUSD?.ETH || 0
          } else {
            tokenValue = 1 // USD
          }
          return parseUnits(tokenValue.toFixed(2), 2)
            .mul(tvlAmount)
            .div(BigNumber.from(10).pow(2)) //1e18
        })
        setPoolStatuses(() => {
          return pools.reduce(
            (acc, pool, i) => ({
              ...acc,
              [pool.name]: { tvl: tvlsUSD[i], isPaused: pausedStatuses[i] },
            }),
            {},
          )
        })
      } catch (err) {
        console.log("Error on fetchStatuses", err)
      }
    }
    void fetchStatuses()
  }, [chainId, library, tokenPricesUSD, poolStatuses])
  return poolStatuses
}
