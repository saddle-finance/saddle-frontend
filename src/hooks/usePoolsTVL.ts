import { POOLS_MAP, PoolName, PoolTypes } from "../constants"
import { useEffect, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import LPTOKEN_UNGUARDED_ABI from "../constants/abis/lpTokenUnguarded.json"
import { LpTokenUnguarded } from "../../types/ethers-contracts/LpTokenUnguarded"
import { getContract } from "../utils"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "."
import { useSelector } from "react-redux"

export default function usePoolTVLs(): { [poolName in PoolName]?: BigNumber } {
  const { chainId, library } = useActiveWeb3React()
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  const [poolTvls, setPoolTvls] = useState<
    { [poolName in PoolName]?: BigNumber }
  >({})

  useEffect(() => {
    if (
      Object.keys(poolTvls).length > 0 && // only run once
      tokenPricesUSD?.BTC &&
      tokenPricesUSD?.ETH
    )
      return
    async function fetchTVLs() {
      if (!library || !chainId) return

      const pools = Object.values(POOLS_MAP)
      const tvls = await Promise.all(
        pools.map(async (p) => {
          console.log(`lptoken address ${p.lpToken.addresses[chainId]}`)
          const lpToken = getContract(
            p.lpToken.addresses[chainId],
            LPTOKEN_UNGUARDED_ABI,
            library,
          ) as LpTokenUnguarded
          return await lpToken.totalSupply()
        }),
      )
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
      setPoolTvls((prevState) => {
        return pools.reduce(
          (acc, pool, i) => ({
            ...acc,
            [pool.name]: tvlsUSD[i],
          }),
          prevState,
        )
      })
    }
    void fetchTVLs()
  }, [chainId, library, tokenPricesUSD, poolTvls])
  return poolTvls
}
