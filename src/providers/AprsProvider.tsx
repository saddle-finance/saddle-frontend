import { BN_DAY_IN_SECONDS, BN_YEAR_IN_SECONDS } from "./../constants/index"
import { BasicToken, TokensContext } from "../providers/TokensProvider"
import React, { ReactElement, useContext } from "react"
import { getPriceDataForPool, shiftBNDecimals } from "../utils"

import { AppState } from "../state"
import { BasicPoolsContext } from "./../providers/BasicPoolsProvider"
import { BigNumber } from "ethers"
import { GaugeContext } from "../providers/GaugeProvider"
import { parseUnits } from "@ethersproject/units"
import { useSelector } from "react-redux"

type MinAndMax = {
  min: BigNumber
  max: BigNumber
}
type AmountReward = {
  rewardToken: BasicToken
  amountPerDay: MinAndMax
  apr?: undefined
}
type AprReward = {
  rewardToken: BasicToken
  apr: MinAndMax
  amountPerDay?: undefined
}
export type GaugeApr = AmountReward | AprReward
type Aprs = Partial<{
  [poolAddress: string]: GaugeApr[]
}>
export const AprsContext = React.createContext<Aprs | null>(null)

export default function AprsProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const aprs = useGaugeAprs()
  return <AprsContext.Provider value={aprs}>{children}</AprsContext.Provider>
}

function useGaugeAprs() {
  const basicPools = useContext(BasicPoolsContext)
  const tokens = useContext(TokensContext)
  const { gauges } = useContext(GaugeContext)
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)

  if (!basicPools || !tokens || !tokenPricesUSD) return null

  return Object.values(basicPools).reduce((acc, basicPool) => {
    const gauge = gauges[basicPool.poolAddress]
    if (!gauge) return acc
    const { rewards, workingSupply } = gauge
    const { assetPrice } = getPriceDataForPool(
      tokens,
      basicPool,
      tokenPricesUSD,
    )
    const rewardAprs = rewards.map(
      ({ tokenAddress, rate: rewardPerSecond }) => {
        const rewardToken = tokens[tokenAddress]
        const rewardPrice = tokenPricesUSD[rewardToken?.symbol || ""] || 0

        if (rewardPrice === 0) {
          const maxRewardPerDay = rewardPerSecond.mul(BN_DAY_IN_SECONDS)
          return {
            rewardToken,
            amountPerDay: {
              min: maxRewardPerDay.mul(4).div(10),
              max: maxRewardPerDay,
            },
          }
        }
        /**
         * Min Reward APR formula:
         * 0.4 * (Reward.rate * gauge.relative_weight) * year_secs * rewardPriceUSD / gauge.working_supply * lpTokenPriceUSD
         */
        const amountStakedUSD = workingSupply.mul(assetPrice) // 1e18 + 1e18=1e36
        const rewardPerYear = rewardPerSecond.mul(BN_YEAR_IN_SECONDS) // 1e18
        const rewardPerYearUSD = rewardPerYear.mul(
          parseUnits(rewardPrice.toFixed(3), 3),
        ) // 1e18 + 3 = 1e21
        const rewardApr = shiftBNDecimals(rewardPerYearUSD, 33).div(
          amountStakedUSD,
        ) // (1e21 + 1e33 = 1e54) / 1e36 = 1e18

        return {
          rewardToken,
          apr: {
            min: rewardApr.mul(4).div(10),
            max: rewardApr,
          },
        }
      },
    )
    return {
      ...acc,
      [basicPool.poolAddress]: rewardAprs,
    }
  }, {}) as Aprs
}
