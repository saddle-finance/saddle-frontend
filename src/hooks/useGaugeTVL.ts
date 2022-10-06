import { useCallback, useContext } from "react"

import { AppState } from "../state"
import { BN_1E18 } from "../constants"
import { BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { BigNumber } from "ethers"
import { GaugeContext } from "../providers/GaugeProvider"
import { TokensContext } from "../providers/TokensProvider"
import { Zero } from "@ethersproject/constants"
import { getPriceDataForPool } from "../utils"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "."
import { useSelector } from "react-redux"

const sushiGaugeName = "SLP-gauge"

export default function useGaugeTVL(): (gaugeAddress?: string) => BigNumber {
  const { chainId } = useActiveWeb3React()
  const { gauges } = useContext(GaugeContext)
  const { sdlWethSushiPool, tokenPricesUSD } = useSelector(
    (state: AppState) => state.application,
  )
  const basicPools = useContext(BasicPoolsContext)
  const tokens = useContext(TokensContext)

  return useCallback(
    (gaugeAddress?: string): BigNumber => {
      if (!gaugeAddress) return Zero
      const gauge = Object.values(gauges).find(
        (gauge) => gauge.address === gaugeAddress,
      )
      const basicPool = basicPools?.[gauge?.poolName || ""]

      if (gauge?.gaugeName === sushiGaugeName) {
        // special case for the sdl/weth pair
        const poolTVL = sdlWethSushiPool?.wethReserve
          ? sdlWethSushiPool.wethReserve // 1e18
              .mul(parseUnits(String(tokenPricesUSD?.["ETH"] || "0.0"), 3)) // 1e18 * 1e3 = 1e21
              .mul(2)
              .div(1e3) // 1e21 / 1e3 = 1e18
          : Zero
        const lpTokenPriceUSD = sdlWethSushiPool?.totalSupply.gt(0)
          ? poolTVL.mul(BN_1E18).div(sdlWethSushiPool.totalSupply)
          : Zero
        return lpTokenPriceUSD.mul(gauge.gaugeTotalSupply || Zero).div(BN_1E18)
      }
      if (basicPool && gauge) {
        const { lpTokenPriceUSD } = getPriceDataForPool(
          tokens,
          basicPool,
          tokenPricesUSD,
          chainId,
        )
        return lpTokenPriceUSD.mul(gauge.gaugeTotalSupply || Zero).div(BN_1E18)
      }
      return Zero
    },
    [gauges, basicPools, sdlWethSushiPool, tokenPricesUSD, tokens, chainId],
  )
}
