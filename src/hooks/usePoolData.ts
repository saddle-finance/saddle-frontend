import { AddressZero, Zero } from "@ethersproject/constants"
import {
  BTC_POOL_NAME,
  POOLS_MAP,
  PoolName,
  TRANSACTION_TYPES,
} from "../constants"
import {
  formatBNToPercentString,
  getContract,
  getTokenSymbolForPoolType,
} from "../utils"
import { useEffect, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import LPTOKEN_GUARDED_ABI from "../constants/abis/lpTokenGuarded.json"
import LPTOKEN_UNGUARDED_ABI from "../constants/abis/lpTokenUnguarded.json"
import { LpTokenGuarded } from "../../types/ethers-contracts/LpTokenGuarded"
import { LpTokenUnguarded } from "../../types/ethers-contracts/LpTokenUnguarded"
import META_SWAP_ABI from "../constants/abis/metaSwap.json"
import { MetaSwap } from "../../types/ethers-contracts/MetaSwap"
import { SwapFlashLoanNoWithdrawFee } from "../../types/ethers-contracts/SwapFlashLoanNoWithdrawFee"
import { getThirdPartyDataForPool } from "../utils/thirdPartyIntegrations"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "."
import { useSelector } from "react-redux"
import { useSwapContract } from "./useContract"

interface TokenShareType {
  percent: string
  symbol: string
  value: BigNumber
}

export type Partners = "keep" | "sharedStake" | "alchemix"
export interface PoolDataType {
  adminFee: BigNumber
  aParameter: BigNumber
  apy: BigNumber | null
  name: string
  reserve: BigNumber | null
  swapFee: BigNumber
  tokens: TokenShareType[]
  totalLocked: BigNumber
  utilization: BigNumber | null
  virtualPrice: BigNumber
  volume: BigNumber | null
  isPaused: boolean
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
}

export interface UserShareType {
  lpTokenBalance: BigNumber
  name: PoolName // TODO: does this need to be on user share?
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
  name: "",
  reserve: null,
  swapFee: Zero,
  tokens: [],
  totalLocked: Zero,
  utilization: null,
  virtualPrice: Zero,
  volume: null,
  aprs: {},
  lpTokenPriceUSD: Zero,
  lpToken: "",
  isPaused: false,
} as PoolDataType

export default function usePoolData(
  poolName?: PoolName,
): PoolDataHookReturnType {
  const { account, library, chainId } = useActiveWeb3React()
  const swapContract = useSwapContract(poolName)
  const { tokenPricesUSD, lastTransactionTimes, swapStats } = useSelector(
    (state: AppState) => state.application,
  )
  const lastDepositTime = lastTransactionTimes[TRANSACTION_TYPES.DEPOSIT]
  const lastWithdrawTime = lastTransactionTimes[TRANSACTION_TYPES.WITHDRAW]
  const lastSwapTime = lastTransactionTimes[TRANSACTION_TYPES.SWAP]
  const lastMigrateTime = lastTransactionTimes[TRANSACTION_TYPES.MIGRATE]

  const [poolData, setPoolData] = useState<PoolDataHookReturnType>([
    {
      ...emptyPoolData,
      name: poolName || "",
    },
    null,
  ])

  useEffect(() => {
    async function getSwapData(): Promise<void> {
      if (
        poolName == null ||
        swapContract == null ||
        tokenPricesUSD == null ||
        library == null ||
        chainId == null
      )
        return
      const POOL = POOLS_MAP[poolName]
      const effectivePoolTokens = POOL.underlyingPoolTokens || POOL.poolTokens
      const isMetaSwap = POOL.metaSwapAddresses != null
      let metaSwapContract = null as MetaSwap | null
      if (isMetaSwap) {
        metaSwapContract = getContract(
          POOL.metaSwapAddresses?.[chainId] as string,
          META_SWAP_ABI,
          library,
          account ?? undefined,
        ) as MetaSwap
      }
      const effectiveSwapContract =
        metaSwapContract || (swapContract as SwapFlashLoanNoWithdrawFee)

      // Swap fees, price, and LP Token data
      const [swapStorage, aParameter, isPaused] = await Promise.all([
        effectiveSwapContract.swapStorage(),
        effectiveSwapContract.getA(),
        effectiveSwapContract.paused(),
      ])
      const { adminFee, lpToken: lpTokenAddress, swapFee } = swapStorage
      let lpTokenContract
      if (poolName === BTC_POOL_NAME) {
        lpTokenContract = getContract(
          lpTokenAddress,
          LPTOKEN_GUARDED_ABI,
          library,
          account ?? undefined,
        ) as LpTokenGuarded
      } else {
        lpTokenContract = getContract(
          lpTokenAddress,
          LPTOKEN_UNGUARDED_ABI,
          library,
          account ?? undefined,
        ) as LpTokenUnguarded
      }
      const [userLpTokenBalance, totalLpTokenBalance] = await Promise.all([
        lpTokenContract.balanceOf(account || AddressZero),
        lpTokenContract.totalSupply(),
      ])

      const virtualPrice = totalLpTokenBalance.isZero()
        ? BigNumber.from(10).pow(18)
        : await effectiveSwapContract.getVirtualPrice()

      // Pool token data
      const tokenBalances: BigNumber[] = await Promise.all(
        effectivePoolTokens.map(async (token, i) => {
          const balance = await effectiveSwapContract.getTokenBalance(i)
          return BigNumber.from(10)
            .pow(18 - token.decimals) // cast all to 18 decimals
            .mul(balance)
        }),
      )
      const tokenBalancesSum: BigNumber = tokenBalances.reduce((sum, b) =>
        sum.add(b),
      )
      const tokenBalancesUSD = effectivePoolTokens.map((token, i, arr) => {
        // use another token to estimate USD price of meta LP tokens
        const symbol =
          isMetaSwap && i === arr.length - 1
            ? getTokenSymbolForPoolType(POOL.type)
            : token.symbol
        const balance = tokenBalances[i]
        return balance
          .mul(parseUnits(String(tokenPricesUSD[symbol] || 0), 18))
          .div(BigNumber.from(10).pow(18))
      })
      const tokenBalancesUSDSum: BigNumber = tokenBalancesUSD.reduce((sum, b) =>
        sum.add(b),
      )
      const lpTokenPriceUSD = tokenBalancesSum.isZero()
        ? Zero
        : tokenBalancesUSDSum
            .mul(BigNumber.from(10).pow(18))
            .div(tokenBalancesSum)
      const { aprs, amountsStaked } = await getThirdPartyDataForPool(
        library,
        chainId,
        account,
        poolName,
        tokenPricesUSD,
        lpTokenPriceUSD,
      )

      function calculatePctOfTotalShare(lpTokenAmount: BigNumber): BigNumber {
        // returns the % of total lpTokens
        return lpTokenAmount
          .mul(BigNumber.from(10).pow(18))
          .div(
            totalLpTokenBalance.isZero()
              ? BigNumber.from("1")
              : totalLpTokenBalance,
          )
      }
      // User share data
      const userLpTokenBalanceStakedElsewhere = Object.keys(
        amountsStaked,
      ).reduce(
        (sum, key) => sum.add(amountsStaked[key as Partners] || Zero),
        Zero,
      )
      // lpToken balance in wallet as a % of total lpTokens, plus lpTokens staked elsewhere
      const userShare = calculatePctOfTotalShare(userLpTokenBalance).add(
        calculatePctOfTotalShare(userLpTokenBalanceStakedElsewhere),
      )
      const userPoolTokenBalances = tokenBalances.map((balance) => {
        return userShare.mul(balance).div(BigNumber.from(10).pow(18))
      })
      const userPoolTokenBalancesSum: BigNumber = userPoolTokenBalances.reduce(
        (sum, b) => sum.add(b),
      )
      const userPoolTokenBalancesUSD = tokenBalancesUSD.map((balance) => {
        return userShare.mul(balance).div(BigNumber.from(10).pow(18))
      })
      const userPoolTokenBalancesUSDSum: BigNumber = userPoolTokenBalancesUSD.reduce(
        (sum, b) => sum.add(b),
      )

      const poolTokens = effectivePoolTokens.map((token, i) => ({
        symbol: token.symbol,
        percent: formatBNToPercentString(
          tokenBalances[i]
            .mul(10 ** 5)
            .div(
              totalLpTokenBalance.isZero()
                ? BigNumber.from("1")
                : tokenBalancesSum,
            ),
          5,
        ),
        value: tokenBalances[i],
      }))
      const userPoolTokens = effectivePoolTokens.map((token, i) => ({
        symbol: token.symbol,
        percent: formatBNToPercentString(
          tokenBalances[i]
            .mul(10 ** 5)
            .div(
              totalLpTokenBalance.isZero()
                ? BigNumber.from("1")
                : tokenBalancesSum,
            ),
          5,
        ),
        value: userPoolTokenBalances[i],
      }))
      const poolAddress = POOL.addresses[chainId].toLowerCase()
      const { oneDayVolume, apy, utilization } =
        swapStats && poolAddress in swapStats
          ? swapStats[poolAddress]
          : { oneDayVolume: null, apy: null, utilization: null }
      const poolData = {
        name: poolName,
        tokens: poolTokens,
        reserve: tokenBalancesUSDSum,
        totalLocked: totalLpTokenBalance,
        virtualPrice: virtualPrice,
        adminFee: adminFee,
        swapFee: swapFee,
        aParameter: aParameter,
        volume: oneDayVolume ? parseUnits(oneDayVolume, 18) : null,
        utilization: utilization ? parseUnits(utilization, 18) : null,
        apy: apy ? parseUnits(apy, 18) : null,
        aprs,
        lpTokenPriceUSD,
        lpToken: POOL.lpToken.symbol,
        isPaused,
      }
      const userShareData = account
        ? {
            name: poolName,
            share: userShare,
            underlyingTokensAmount: userPoolTokenBalancesSum,
            usdBalance: userPoolTokenBalancesUSDSum,
            tokens: userPoolTokens,
            lpTokenBalance: userLpTokenBalance,
            amountsStaked: Object.keys(amountsStaked).reduce((acc, key) => {
              const amount = amountsStaked[key as Partners]
              return key
                ? {
                    ...acc,
                    [key]: amount
                      ?.mul(virtualPrice)
                      .div(BigNumber.from(10).pow(18)),
                  }
                : acc
            }, {}), // this is # of underlying tokens (eg btc), not lpTokens
          }
        : null
      setPoolData([poolData, userShareData])
    }
    void getSwapData()
  }, [
    lastDepositTime,
    lastWithdrawTime,
    lastSwapTime,
    lastMigrateTime,
    poolName,
    swapContract,
    tokenPricesUSD,
    account,
    library,
    chainId,
    swapStats,
  ])

  return poolData
}
