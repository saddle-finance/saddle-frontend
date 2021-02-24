import { POOLS_MAP, PoolName, TRANSACTION_TYPES } from "../constants"
import { formatBNToPercentString, getContract } from "../utils"
import { useAllContracts, useSwapContract } from "./useContract"
import { useEffect, useState } from "react"

import { AddressZero } from "@ethersproject/constants"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import LPTOKEN_ABI from "../constants/abis/lpToken.json"
import { LpToken } from "../../types/ethers-contracts/LpToken"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "."
import { useSelector } from "react-redux"

interface TokenShareType {
  percent: string
  symbol: string
  value: BigNumber
}

export interface PoolDataType {
  adminFee: BigNumber
  apy: string // TODO: calculate
  name: string
  reserve: BigNumber
  swapFee: BigNumber
  tokens: TokenShareType[]
  totalLocked: BigNumber
  utilization: string // TODO: calculate
  virtualPrice: BigNumber
  volume: string // TODO: calculate
  keepApr: BigNumber
  lpTokenPriceUSD: BigNumber
}

export interface UserShareType {
  avgBalance: BigNumber
  currentWithdrawFee: BigNumber
  lpTokenBalance: BigNumber
  lpTokenMinted: BigNumber
  name: string // TODO: does this need to be on user share?
  share: BigNumber
  tokens: TokenShareType[]
  usdBalance: BigNumber
  value: BigNumber
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
  const lastSwapTime = lastTransactionTimes[TRANSACTION_TYPES.SWAP]

  useEffect(() => {
    async function getSwapData(): Promise<void> {
      if (
        poolName == null ||
        swapContract == null ||
        tokenContracts == null ||
        tokenPricesUSD == null ||
        library == null ||
        account == null
      )
        return

      const POOL_TOKENS = POOLS_MAP[poolName]

      // Swap fees, price, and LP Token data
      const [userCurrentWithdrawFee, swapStorage] = await Promise.all([
        swapContract.calculateCurrentWithdrawFee(account || AddressZero),
        swapContract.swapStorage(),
      ])
      const { adminFee, lpToken: lpTokenAddress, swapFee } = swapStorage
      const lpToken = getContract(
        lpTokenAddress,
        LPTOKEN_ABI,
        library,
        account ?? undefined,
      ) as LpToken
      const [
        userLpTokenBalance,
        userLpTokenMinted,
        totalLpTokenBalance,
      ] = await Promise.all([
        lpToken.balanceOf(account || AddressZero),
        lpToken.mintedAmounts(account || AddressZero),
        lpToken.totalSupply(),
      ])

      const virtualPrice = totalLpTokenBalance.isZero()
        ? BigNumber.from(10).pow(18)
        : await swapContract.getVirtualPrice()

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
      const lpTokenPriceUSD = tokenBalancesSum.isZero()
        ? BigNumber.from(0)
        : tokenBalancesUSDSum
            .mul(BigNumber.from(10).pow(18))
            .div(tokenBalancesSum)

      // (weeksPerYear * KEEPPerWeek * KEEPPrice) / (BTCPrice * BTCInPool)
      const comparisonPoolToken = POOL_TOKENS[0]
      const keepAPRNumerator = BigNumber.from(52 * 250000)
        .mul(BigNumber.from(10).pow(18))
        .mul(parseUnits(String(tokenPricesUSD.KEEP), 18))
      const keepAPRDenominator = totalLpTokenBalance
        .mul(parseUnits(String(tokenPricesUSD[comparisonPoolToken.symbol]), 6))
        .div(1e6)

      const keepApr = totalLpTokenBalance.isZero()
        ? keepAPRNumerator
        : keepAPRNumerator.div(keepAPRDenominator)

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
      const userPoolTokens = POOL_TOKENS.map((token, i) => ({
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
      const poolData = {
        name: poolName,
        tokens: poolTokens,
        reserve: tokenBalancesUSDSum,
        totalLocked: totalLpTokenBalance,
        virtualPrice: virtualPrice,
        adminFee: adminFee,
        swapFee: swapFee,
        volume: "XXX", // TODO
        utilization: "XXX", // TODO
        apy: "XXX", // TODO
        keepApr,
        lpTokenPriceUSD,
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
            lpTokenMinted: userLpTokenMinted,
          }
        : null
      setPoolData([poolData, userShareData])
    }
    void getSwapData()
  }, [
    lastDepositTime,
    lastWithdrawTime,
    lastSwapTime,
    poolName,
    swapContract,
    tokenContracts,
    tokenPricesUSD,
    account,
    library,
  ])

  return poolData
}
