import { A_PRECISION, PoolTypes } from "./../constants/index"
import { AprsContext, GaugeApr } from "./../providers/AprsProvider"
import {
  Partners,
  getThirdPartyDataForPool,
} from "../utils/thirdPartyIntegrations"
import { bnSum, calculateFraction, getPriceDataForExpandedPool } from "../utils"
import { useContext, useEffect, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { ExpandedPoolsContext } from "./../providers/ExpandedPoolsProvider"
import { GaugeContext } from "./../providers/GaugeProvider"
import { MinichefContext } from "../providers/MinichefProvider"
import { UserStateContext } from "./../providers/UserStateProvider"
import { Zero } from "@ethersproject/constants"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "."
import { useSelector } from "react-redux"

interface TokenShareType {
  symbol: string
  value: BigNumber
  decimals: number
  name: string
  address: string
}

export interface PoolDataType {
  adminFee: BigNumber
  aParameter: BigNumber
  futureA: BigNumber
  futureATime: BigNumber
  apy: BigNumber | null
  claimableAmount: Partial<Record<Partners, BigNumber>>
  name: string
  reserve: BigNumber | null
  swapFee: BigNumber
  tokens: TokenShareType[]
  underlyingTokens: TokenShareType[]
  totalLocked: BigNumber
  utilization: BigNumber | null
  virtualPrice: BigNumber
  volume: BigNumber | null
  sdlPerDay: BigNumber | null
  isPaused: boolean
  poolAddress: string
  gaugeAprs: GaugeApr[] | null
  aprs: Partial<
    Record<
      Partners,
      {
        apr: BigNumber
        symbol: string
      }
    >
  >
  lpTokenPriceUSD: BigNumber
  lpToken: string
  isMigrated: boolean
  isGuarded: boolean
  isMetaSwap: boolean
  poolType: PoolTypes
}

export interface UserShareType {
  lpTokenBalance: BigNumber
  name: string // TODO: does this need to be on user share?
  share: BigNumber
  tokens: TokenShareType[]
  usdBalance: BigNumber
  underlyingTokensAmount: BigNumber
  amountsStaked: Partial<Record<Partners, BigNumber>>
}

export type PoolDataHookReturnType = [
  PoolDataType,
  UserShareType | null,
  React.Dispatch<React.SetStateAction<string | undefined>>,
]

const emptyPoolData = {
  adminFee: Zero,
  aParameter: Zero,
  futureA: Zero,
  futureATime: Zero,
  apy: null,
  claimableAmount: Zero,
  name: "",
  reserve: null,
  swapFee: Zero,
  tokens: [],
  underlyingTokens: [],
  totalLocked: Zero,
  poolAddress: "",
  utilization: null,
  virtualPrice: Zero,
  volume: null,
  gaugeAprs: null,
  aprs: {},
  lpTokenPriceUSD: Zero,
  lpToken: "",
  isPaused: false,
  isMigrated: false,
  sdlPerDay: null,
  isGuarded: false,
  isMetaSwap: false,
  poolType: PoolTypes.OTHER,
} as PoolDataType

/**
 *
 * Notes
 * include staked amounts for gauges and minichef.
 * include claimable rewards for gauges and minichef.
 */

export default function usePoolData(name?: string): PoolDataHookReturnType {
  const [poolName, setPoolName] = useState<string | undefined>(name)
  const { account, library, chainId } = useActiveWeb3React()
  const userState = useContext(UserStateContext)
  const minichefData = useContext(MinichefContext)
  const { data: expandedPools } = useContext(ExpandedPoolsContext)
  const { gauges } = useContext(GaugeContext)
  const gaugeAprs = useContext(AprsContext)
  const { tokenPricesUSD, swapStats } = useSelector(
    (state: AppState) => state.application,
  )
  const [poolData, setPoolData] = useState<PoolDataType>({
    ...emptyPoolData,
    name: poolName || "",
  })
  const [userShare, setUserShare] = useState<UserShareType | null>(null)

  useEffect(() => {
    async function getSwapData(): Promise<void> {
      const expandedPool = poolName ? expandedPools.byName[poolName] : null
      if (
        // isLoading ||
        expandedPool == null ||
        poolName == null ||
        tokenPricesUSD == null ||
        library == null ||
        chainId == null
      ) {
        setPoolData({
          ...emptyPoolData,
          name: poolName || "",
        })
        setUserShare(null)
        return
      }
      try {
        const poolMinichefData = minichefData?.pools?.[expandedPool.poolAddress]
        const poolGaugeData = gauges?.[expandedPool.lpToken.address]
        const priceDataForPool = getPriceDataForExpandedPool(
          expandedPool,
          tokenPricesUSD,
        )

        // Pool token data
        const { aprs, amountsStaked, claimableAmount } =
          await getThirdPartyDataForPool(
            library,
            chainId,
            account,
            {
              name: poolName,
              address: expandedPool.poolAddress,
              lpTokenAddress: expandedPool.lpToken.address,
            },
            tokenPricesUSD,
            priceDataForPool.lpTokenPriceUSD,
          )
        const poolGaugeAprs = gaugeAprs?.[poolGaugeData?.address ?? ""]

        // User share data
        const userWalletLpTokenBalance =
          userState?.tokenBalances?.[expandedPool.lpToken.address] || Zero
        const userLpTokenBalanceStakedElsewhere = Object.keys(
          amountsStaked,
        ).reduce((sum, key) => sum.add(amountsStaked[key] || Zero), Zero)
        // lpToken balance in wallet as a % of total lpTokens, plus lpTokens staked elsewhere
        const userShare = calculateFraction(
          userWalletLpTokenBalance,
          expandedPool.lpTokenSupply,
        )
          .add(
            calculateFraction(
              userLpTokenBalanceStakedElsewhere,
              expandedPool.lpTokenSupply,
            ),
          )
          .add(
            calculateFraction(
              (poolMinichefData?.pid &&
                userState?.minichef?.[poolMinichefData?.pid]?.amountStaked) ||
                Zero,
              expandedPool.lpTokenSupply,
            ),
          )
          .add(
            calculateFraction(
              userState?.gaugeRewards?.[expandedPool.poolAddress]
                ?.amountStaked || Zero,
              expandedPool.lpTokenSupply,
            ),
          )
        const userPoolTokenBalances = priceDataForPool.tokenBalances1e18.map(
          (balance) => {
            return userShare.mul(balance).div(BigNumber.from(10).pow(18))
          },
        )
        const userPoolTokenBalancesSum: BigNumber =
          userPoolTokenBalances.reduce(bnSum)
        const userPoolTokenBalancesUSD = priceDataForPool.tokenBalancesUSD.map(
          (balance) => {
            return userShare.mul(balance).div(BigNumber.from(10).pow(18))
          },
        )
        const userPoolTokenBalancesUSDSum: BigNumber =
          userPoolTokenBalancesUSD.reduce(bnSum)

        const poolTokens = expandedPool.tokens.map((token, i) => ({
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          value: priceDataForPool.tokenBalances1e18[i],
          address: token.address,
        }))
        const underlyingPoolTokens =
          expandedPool.underlyingTokens?.map((token, i) => ({
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            value: priceDataForPool.underlyingTokenBalances1e18[i] || Zero,
            address: token.address,
          })) || []
        const userPoolTokens = expandedPool.tokens.map((token, i) => ({
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          value: userPoolTokenBalances[i],
          address: token.address,
        }))

        const { oneDayVolume, apy, utilization } = swapStats?.[chainId]?.[
          expandedPool.poolAddress
        ] || { oneDayVolume: null, apy: null, utilization: null }

        const poolData = {
          name: poolName,
          tokens: poolTokens,
          underlyingTokens: underlyingPoolTokens,
          totalLocked: expandedPool.lpTokenSupply,
          virtualPrice: expandedPool.virtualPrice,
          adminFee: expandedPool.adminFee,
          swapFee: expandedPool.swapFee,
          aParameter: expandedPool.aParameter,
          futureA: expandedPool.futureA.div(A_PRECISION),
          futureATime: expandedPool.futureATime,
          isPaused: expandedPool.isPaused,
          isMigrated: expandedPool.isMigrated,
          isMetaSwap: expandedPool.isMetaSwap,
          isGuarded: expandedPool.isGuarded,
          lpToken: expandedPool.lpToken.address, // will be address, was symbol
          poolType: expandedPool.typeOfAsset,
          poolAddress: expandedPool.poolAddress,

          lpTokenPriceUSD: priceDataForPool.lpTokenPriceUSD, // USD
          reserve: priceDataForPool.tokenBalancesSumUSD, // USD

          volume: oneDayVolume ? parseUnits(oneDayVolume, 18) : null, // rm - api
          utilization: utilization ? parseUnits(utilization, 18) : null, // rm - api
          apy: apy ? parseUnits(apy, 18) : null, // rm - api

          gaugeAprs: poolGaugeAprs ?? null,
          aprs, // rm - move to minichef provider + thirdparty provider
          sdlPerDay:
            minichefData?.pools[expandedPool.poolAddress]?.sdlPerDay || Zero,
          claimableAmount, // move to minichef provider
        }
        const userShareData = account
          ? {
              name: poolName,
              share: userShare,
              underlyingTokensAmount: userPoolTokenBalancesSum,
              usdBalance: userPoolTokenBalancesUSDSum,
              tokens: userPoolTokens,
              lpTokenBalance: userWalletLpTokenBalance,
              amountsStaked: Object.keys(amountsStaked).reduce((acc, key) => {
                const amount = amountsStaked[key]
                return key
                  ? {
                      ...acc,
                      [key]: amount
                        ?.mul(expandedPool.virtualPrice)
                        .div(BigNumber.from(10).pow(18)),
                    }
                  : acc
              }, {}), // this is # of underlying tokens (eg btc), not lpTokens
            }
          : null
        setPoolData(poolData)
        setUserShare(userShareData)
      } catch (err) {
        console.log("Error on getSwapData,", err)
      }
    }
    void getSwapData()
  }, [
    // isLoading,
    account,
    chainId,
    library,
    minichefData?.pools,
    poolName,
    swapStats,
    tokenPricesUSD,
    userState?.minichef,
    userState?.tokenBalances,
    userState?.gaugeRewards,
    gaugeAprs,
    gauges,
    expandedPools.byName,
  ])

  return [poolData, userShare, setPoolName]
}
