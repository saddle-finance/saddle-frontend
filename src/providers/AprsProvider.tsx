import { BN_DAY_IN_SECONDS, BN_YEAR_IN_SECONDS } from "./../constants/index"
import {
  BasicToken,
  BasicTokens,
  TokensContext,
} from "../providers/TokensProvider"
import React, { ReactElement, useContext } from "react"

import { AppState } from "../state"
import { BasicPoolsContext } from "./../providers/BasicPoolsProvider"
import { BigNumber } from "ethers"
import { GaugeContext } from "../providers/GaugeProvider"
import { GaugeReward } from "../utils/gauges"
import { parseUnits } from "@ethersproject/units"
import { shiftBNDecimals } from "../utils"
import useGaugeTVL from "../hooks/useGaugeTVL"
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
  [gaugeAddress: string]: GaugeApr[]
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
  const getGaugeTVL = useGaugeTVL()
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)

  if (!basicPools || !tokens || !tokenPricesUSD) return null

  return Object.values(gauges).reduce((acc, gauge) => {
    const { rewards, address } = gauge
    const gaugeTVL = getGaugeTVL(address)

    const rewardAprs = buildRewards(rewards, tokens, tokenPricesUSD, gaugeTVL)
    return {
      ...acc,
      [address]: rewardAprs,
    }
  }, {}) as Aprs
}

/**
 * Builds the APRs for a gauge, given generic pool data (supply and asset price)
 */
function buildRewards(
  gaugeRewards: GaugeReward[],
  tokens: NonNullable<BasicTokens>,
  tokenPricesUSD: Partial<{ [symbol: string]: number }>,
  amountStakedUSD: BigNumber,
): GaugeApr[] {
  return gaugeRewards.map(({ tokenAddress, rate: rewardPerSecond }) => {
    const rewardToken = tokens[tokenAddress]
    const rewardPrice = tokenPricesUSD[rewardToken?.symbol || ""] || 0

    if (rewardPrice === 0 || amountStakedUSD.isZero()) {
      const maxRewardPerDay = rewardPerSecond.mul(BN_DAY_IN_SECONDS)
      return {
        rewardToken,
        amountPerDay: {
          min: maxRewardPerDay.mul(4).div(10),
          max: maxRewardPerDay,
        },
      } as AmountReward
    }
    // @dev see "Math" section of readme
    const rewardPerYear = rewardPerSecond.mul(BN_YEAR_IN_SECONDS) // 1e18
    const rewardPerYearUSD = rewardPerYear.mul(
      parseUnits(rewardPrice.toFixed(3), 3),
    ) // 1e18 * 1e3 = 1e21
    const rewardApr = shiftBNDecimals(rewardPerYearUSD, 15).div(amountStakedUSD) // (1e21 * 1e15 = 1e36) / 1e18 = 1e18

    return {
      rewardToken,
      apr: {
        min: rewardApr.mul(4).div(10),
        max: rewardApr,
      },
    } as AprReward
  })
}
