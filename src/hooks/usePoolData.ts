import { AprsContext, GaugeApr } from "./../providers/AprsProvider"
import { BasicToken, TokensContext } from "../providers/TokensProvider"
import {
  Partners,
  getThirdPartyDataForPool,
} from "../utils/thirdPartyIntegrations"
import { bnSum, calculateFraction, getPriceDataForPool } from "../utils"
import { useContext, useEffect, useState } from "react"

import { AppState } from "../state"
import { BasicPoolsContext } from "./../providers/BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import { MinichefContext } from "../providers/MinichefProvider"
import { PoolTypes } from "./../constants/index"
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

export type PoolDataHookReturnType = [PoolDataType, UserShareType | null]

const emptyPoolData = {
  adminFee: Zero,
  aParameter: Zero,
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

export default function usePoolData(poolName?: string): PoolDataHookReturnType {
  const { account, library, chainId } = useActiveWeb3React()
  const basicPools = useContext(BasicPoolsContext)
  const tokens = useContext(TokensContext)
  const userState = useContext(UserStateContext)
  const minichefData = useContext(MinichefContext)
  const gaugeAprs = useContext(AprsContext)
  const { tokenPricesUSD, swapStats } = useSelector(
    (state: AppState) => state.application,
  )
  const [poolData, setPoolData] = useState<PoolDataHookReturnType>([
    {
      ...emptyPoolData,
      name: poolName || "",
    },
    null,
  ])

  useEffect(() => {
    async function getSwapData(): Promise<void> {
      const basicPool = poolName ? basicPools?.[poolName] : null
      if (
        poolName == null ||
        tokens == null ||
        tokenPricesUSD == null ||
        library == null ||
        chainId == null ||
        basicPool == null
      ) {
        setPoolData([
          {
            ...emptyPoolData,
            name: poolName || "",
          },
          null,
        ])
        return
      }
      try {
        const poolMinichefData = minichefData?.pools?.[basicPool.poolAddress]
        // const poolGaugeData = gauges?.[basicPool.poolAddress]
        const expandedPoolTokens = basicPool.tokens.map(
          (tokenAddr) => tokens[tokenAddr],
        ) as BasicToken[]
        const expandedUnderlyingPoolTokens = basicPool.isMetaSwap
          ? (basicPool.underlyingTokens.map(
              (tokenAddr) => tokens[tokenAddr],
            ) as BasicToken[])
          : null
        if (
          expandedPoolTokens.filter(Boolean).length !==
            basicPool.tokens.length ||
          (basicPool.isMetaSwap &&
            expandedUnderlyingPoolTokens &&
            expandedUnderlyingPoolTokens.filter(Boolean).length !==
              basicPool.underlyingTokens.length)
        ) {
          console.error("Could not find all tokens for pool", poolName)
          return
        }
        const priceDataForPool = getPriceDataForPool(
          tokens,
          basicPool,
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
              address: basicPool.poolAddress,
              lpTokenAddress: basicPool.lpToken,
            },
            tokenPricesUSD,
            priceDataForPool.lpTokenPriceUSD,
          )
        const poolGaugeAprs = gaugeAprs?.[basicPool.poolAddress]

        // User share data
        const userWalletLpTokenBalance =
          userState?.tokenBalances?.[basicPool.lpToken] || Zero
        const userLpTokenBalanceStakedElsewhere = Object.keys(
          amountsStaked,
        ).reduce((sum, key) => sum.add(amountsStaked[key] || Zero), Zero)
        // lpToken balance in wallet as a % of total lpTokens, plus lpTokens staked elsewhere
        const userShare = calculateFraction(
          userWalletLpTokenBalance,
          basicPool.lpTokenSupply,
        )
          .add(
            calculateFraction(
              userLpTokenBalanceStakedElsewhere,
              basicPool.lpTokenSupply,
            ),
          )
          .add(
            calculateFraction(
              (poolMinichefData?.pid &&
                userState?.minichef?.[poolMinichefData?.pid]?.amountStaked) ||
                Zero,
              basicPool.lpTokenSupply,
            ),
          )
          .add(
            calculateFraction(
              userState?.gaugeRewards?.[basicPool.poolAddress]?.amountStaked ||
                Zero,
              basicPool.lpTokenSupply,
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

        const poolTokens = expandedPoolTokens.map((token, i) => ({
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          value: priceDataForPool.tokenBalances1e18[i],
          address: token.address,
        }))
        const underlyingPoolTokens =
          expandedUnderlyingPoolTokens?.map((token) => ({
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            value: Zero, // TODO
            address: token.address,
          })) || []
        const userPoolTokens = expandedPoolTokens.map((token, i) => ({
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          value: userPoolTokenBalances[i],
          address: token.address,
        }))
        const { oneDayVolume, apy, utilization } = swapStats?.[
          basicPool.poolAddress
        ] || { oneDayVolume: null, apy: null, utilization: null }

        const poolData = {
          name: poolName,
          tokens: poolTokens,
          underlyingTokens: underlyingPoolTokens,
          totalLocked: basicPool.lpTokenSupply,
          virtualPrice: basicPool.virtualPrice,
          adminFee: basicPool.adminFee,
          swapFee: basicPool.swapFee,
          aParameter: basicPool.aParameter,
          isPaused: basicPool.isPaused,
          isMigrated: basicPool.isMigrated,
          isMetaSwap: basicPool.isMetaSwap,
          isGuarded: basicPool.isGuarded,
          lpToken: basicPool.lpToken, // will be address, was symbol
          poolType: basicPool.typeOfAsset,
          poolAddress: basicPool.poolAddress,

          lpTokenPriceUSD: priceDataForPool.lpTokenPriceUSD, // USD
          reserve: priceDataForPool.tokenBalancesSumUSD, // USD

          volume: oneDayVolume ? parseUnits(oneDayVolume, 18) : null, // rm - api
          utilization: utilization ? parseUnits(utilization, 18) : null, // rm - api
          apy: apy ? parseUnits(apy, 18) : null, // rm - api

          gaugeAprs: poolGaugeAprs ?? null,
          aprs, // rm - move to minichef provider + thirdparty provider
          sdlPerDay:
            minichefData?.pools[basicPool.poolAddress]?.sdlPerDay || Zero,
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
                        ?.mul(basicPool.virtualPrice)
                        .div(BigNumber.from(10).pow(18)),
                    }
                  : acc
              }, {}), // this is # of underlying tokens (eg btc), not lpTokens
            }
          : null
        setPoolData([poolData, userShareData])
      } catch (err) {
        console.log("Error on getSwapData,", err)
      }
    }
    void getSwapData()
  }, [
    account,
    basicPools,
    chainId,
    library,
    minichefData?.pools,
    poolName,
    swapStats,
    tokenPricesUSD,
    tokens,
    userState?.minichef,
    userState?.tokenBalances,
    gaugeAprs,
  ])

  return poolData
}
