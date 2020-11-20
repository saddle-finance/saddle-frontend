import {
  BTC_POOL_TOKENS,
  PoolName,
  STABLECOIN_POOL_NAME,
  STABLECOIN_POOL_TOKENS,
  TRANSACTION_TYPES,
} from "../constants"
import { formatUnits, parseUnits } from "@ethersproject/units"
import { useAllContracts, useSwapContracts } from "./useContract"
import { useEffect, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import LPTOKEN_ABI from "../constants/abis/lpToken.json"
import { getContract } from "../utils"
import { useActiveWeb3React } from "."
import { useSelector } from "react-redux"

interface TokenShareType {
  name: string
  icon: string
  percent: string
  value: string
}
export interface UserShareType {
  name: string
  share: string
  value: string
  usdBalance: string
  avgBalance: string
  tokens: TokenShareType[]
}
export interface PoolDataType {
  name: string
  tokens: TokenShareType[]
  reserve: string
  totalLocked: string
  virtualPrice: string
  adminFee: string
  swapFee: string
  volume: string
  utilization: string
  userShare: UserShareType | null
}

export default function usePoolData(poolName: PoolName): PoolDataType | null {
  const { account, library } = useActiveWeb3React()
  const swapContracts = useSwapContracts()
  const tokenContracts = useAllContracts()
  const [poolData, setPoolData] = useState<PoolDataType | null>(null)
  const { tokenPricesUSD, lastTransactionTimes } = useSelector(
    (state: AppState) => state.application,
  )
  const lastDepositTime = lastTransactionTimes[TRANSACTION_TYPES.DEPOSIT]

  useEffect(() => {
    async function getSwapData(): Promise<void> {
      if (
        poolName == null ||
        swapContracts == null ||
        tokenContracts == null ||
        tokenPricesUSD == null ||
        library == null
      )
        return

      const tokens =
        poolName === STABLECOIN_POOL_NAME
          ? STABLECOIN_POOL_TOKENS
          : BTC_POOL_TOKENS // TODO: make this a util if we do it often enough

      // Swap fees, price, and LP Token data
      const virtualPrice = await swapContracts?.[poolName]?.getVirtualPrice()
      const {
        adminFee,
        lpToken: lpTokenAddress,
        swapFee,
      } = await swapContracts?.[poolName]?.swapStorage()
      const lpToken = getContract(
        lpTokenAddress,
        LPTOKEN_ABI,
        library,
        account ?? undefined,
      )
      const userLpTokenBalance = await lpToken.balanceOf(account)
      const totalLpTokenBalance = await lpToken.totalSupply()

      // Pool token data
      const tokenBalances: BigNumber[] = await Promise.all(
        tokens.map(async (token, i) => {
          const balance = await swapContracts?.[poolName]?.getTokenBalance(i)
          return BigNumber.from(10)
            .pow(18 - token.decimals) // cast all to 18 decimals
            .mul(balance)
        }),
      )
      const tokenBalancesSum: BigNumber = tokenBalances.reduce((sum, b) =>
        sum.add(b),
      )
      const tokenBalancesUSD = tokens.map((token, i) => {
        const balance = tokenBalances[i]
        return balance
          .mul(parseUnits(String(tokenPricesUSD[token.symbol]), 18))
          .div(BigNumber.from(10).pow(18))
      })
      const tokenBalancesUSDSum: BigNumber = tokenBalancesUSD.reduce((sum, b) =>
        sum.add(b),
      )

      // User share data
      const userShare = userLpTokenBalance
        .mul(BigNumber.from(10).pow(18))
        .div(totalLpTokenBalance)
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

      const poolTokens = tokens.map((token, i) => ({
        name: token.name,
        icon: token.icon,
        percent: parseFloat(
          formatUnits(tokenBalances[i].mul(100).div(tokenBalancesSum), 0),
        ).toFixed(3),
        value: parseFloat(formatUnits(tokenBalances[i], 18)).toFixed(3),
      }))
      const userPoolTokens = tokens.map((token, i) => ({
        name: token.name,
        icon: token.icon,
        percent: parseFloat(
          formatUnits(
            userPoolTokenBalances[i].mul(100).div(tokenBalancesSum),
            0,
          ),
        ).toFixed(3),
        value: parseFloat(formatUnits(userPoolTokenBalances[i], 18)).toFixed(3),
      }))
      setPoolData({
        name: poolName,
        tokens: poolTokens,
        reserve: parseFloat(formatUnits(tokenBalancesSum, 18)).toFixed(3),
        totalLocked: parseFloat(formatUnits(tokenBalancesUSDSum, 18)).toFixed(
          2,
        ),
        virtualPrice: parseFloat(formatUnits(virtualPrice, 18)).toFixed(5),
        adminFee: formatUnits(adminFee, 10),
        swapFee: formatUnits(swapFee, 10),
        volume: "XXX", // TODO
        utilization: "XXX", // TODO
        userShare: account
          ? {
              name: poolName,
              share: parseFloat(formatUnits(userShare, 18)).toFixed(5),
              value: parseFloat(
                formatUnits(userPoolTokenBalancesSum, 18),
              ).toFixed(2),
              usdBalance: parseFloat(
                formatUnits(userPoolTokenBalancesUSDSum, 18),
              ).toFixed(2),
              avgBalance: parseFloat(
                formatUnits(userPoolTokenBalancesSum, 18),
              ).toFixed(2), // TODO: how to calculate?
              tokens: userPoolTokens,
            }
          : null,
      })
    }
    getSwapData()
  }, [
    lastDepositTime,
    poolName,
    swapContracts,
    tokenContracts,
    tokenPricesUSD,
    account,
    library,
  ])

  return poolData
}
