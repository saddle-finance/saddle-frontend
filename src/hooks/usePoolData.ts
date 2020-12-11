import { POOLS_MAP, PoolName, TRANSACTION_TYPES } from "../constants"
import { formatUnits, parseUnits } from "@ethersproject/units"
import { useAllContracts, useSwapContract } from "./useContract"
import { useEffect, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import LPTOKEN_ABI from "../constants/abis/lpToken.json"
import { getContract } from "../utils"
import { useActiveWeb3React } from "."
import { useSelector } from "react-redux"

interface TokenShareType {
  percent: string
  symbol: string
  value: BigNumber
}

export interface UserShareType {
  avgBalance: BigNumber
  currentWithdrawFee: BigNumber
  lpTokenBalance: BigNumber
  name: string // TODO: does this need to be on user share?
  share: BigNumber
  tokens: TokenShareType[]
  usdBalance: BigNumber
  value: BigNumber
}
export interface PoolDataType {
  adminFee: BigNumber
  apy: string // TODO: calculate
  name: string
  reserve: BigNumber
  swapFee: BigNumber
  tokens: TokenShareType[]
  totalLocked: string
  utilization: string // TODO: calculate
  virtualPrice: BigNumber
  volume: string // TODO: calculate
}

export type PoolDataHookReturnType = [PoolDataType | null, UserShareType | null]

export default function usePoolData(
  poolName: PoolName,
): PoolDataHookReturnType {
  const { account, library } = useActiveWeb3React()
  const swapContract = useSwapContract(poolName)
  const tokenContracts = useAllContracts()
  const [poolData, setPoolData] = useState<PoolDataHookReturnType>([null, null])
  const { tokenPricesUSD, lastTransactionTimes } = useSelector(
    (state: AppState) => state.application,
  )
  const lastDepositTime = lastTransactionTimes[TRANSACTION_TYPES.DEPOSIT]
  const lastWithdrawTime = lastTransactionTimes[TRANSACTION_TYPES.WITHDRAW]

  useEffect(() => {
    async function getSwapData(): Promise<void> {
      if (
        poolName == null ||
        swapContract == null ||
        tokenContracts == null ||
        tokenPricesUSD == null ||
        library == null
      )
        return

      const POOL_TOKENS = POOLS_MAP[poolName]

      // Swap fees, price, and LP Token data
      const [userCurrentWithdrawFee, swapStorage] = await Promise.all([
        swapContract.calculateCurrentWithdrawFee(account),
        swapContract.swapStorage(),
      ])
      const { adminFee, lpToken: lpTokenAddress, swapFee } = swapStorage
      const lpToken = getContract(
        lpTokenAddress,
        LPTOKEN_ABI,
        library,
        account ?? undefined,
      )
      const [userLpTokenBalance, totalLpTokenBalance] = await Promise.all([
        lpToken.balanceOf(account),
        lpToken.totalSupply(),
      ])

      let virtualPrice
      if (totalLpTokenBalance.isZero()) {
        virtualPrice = BigNumber.from(10).pow(18)
      } else {
        virtualPrice = await swapContract.getVirtualPrice()
      }

      // Pool token data
      const tokenBalances: BigNumber[] = await Promise.all(
        POOL_TOKENS.map(async (token, i) => {
          const balance = await swapContract.getTokenBalance(i)
          return BigNumber.from(10)
            .pow(18 - token.decimals) // cast all to 18 decimals
            .mul(balance)
        }),
      )
      const tokenBalancesSum: BigNumber = tokenBalances.reduce((sum, b) =>
        sum.add(b),
      )
      const tokenBalancesUSD = POOL_TOKENS.map((token, i) => {
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
        .div(
          totalLpTokenBalance.isZero()
            ? BigNumber.from("1")
            : totalLpTokenBalance,
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

      const poolTokens = POOL_TOKENS.map((token, i) => ({
        symbol: token.symbol,
        percent: parseFloat(
          formatUnits(
            tokenBalances[i]
              .mul(10 ** 5)
              .div(
                totalLpTokenBalance.isZero()
                  ? BigNumber.from("1")
                  : tokenBalancesSum,
              ),
            3,
          ),
        ).toFixed(3),
        value: tokenBalances[i],
      }))
      const userPoolTokens = POOL_TOKENS.map((token, i) => ({
        symbol: token.symbol,
        percent: parseFloat(
          formatUnits(
            userPoolTokenBalances[i]
              .mul(10 ** 5)
              .div(
                totalLpTokenBalance.isZero()
                  ? BigNumber.from("1")
                  : totalLpTokenBalance,
              ),
            3,
          ),
        ).toFixed(3),
        value: userPoolTokenBalances[i],
      }))
      const poolData = {
        name: poolName,
        tokens: poolTokens,
        reserve: tokenBalancesUSDSum,
        totalLocked: "XXX", // TODO
        virtualPrice: virtualPrice,
        adminFee: adminFee,
        swapFee: swapFee,
        volume: "XXX", // TODO
        utilization: "XXX", // TODO
        apy: "XXX", // TODO
      }
      const userShareData = account
        ? {
            name: poolName,
            share: userShare,
            value: userPoolTokenBalancesSum,
            usdBalance: userPoolTokenBalancesUSDSum,
            avgBalance: userPoolTokenBalancesSum,
            tokens: userPoolTokens,
            currentWithdrawFee: userCurrentWithdrawFee,
            lpTokenBalance: userLpTokenBalance,
          }
        : null
      setPoolData([poolData, userShareData])
    }
    getSwapData()
  }, [
    lastDepositTime,
    lastWithdrawTime,
    poolName,
    swapContract,
    tokenContracts,
    tokenPricesUSD,
    account,
    library,
  ])

  return poolData
}
