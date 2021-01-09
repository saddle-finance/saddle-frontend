import {
  MAINNET_DEPLOYED_BLOCK,
  POOLS_MAP,
  PoolName,
  TRANSACTION_TYPES,
} from "../constants"
import { formatUnits, parseUnits } from "@ethersproject/units"
import { useAllContracts, useSwapContract } from "./useContract"
import { useEffect, useState } from "react"

import ALLOWLIST_ABI from "../constants/abis/allowList.json"
import { AddressZero } from "@ethersproject/constants"
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
  totalLocked: BigNumber
  utilization: string // TODO: calculate
  virtualPrice: BigNumber
  volume: string // TODO: calculate
  poolAccountLimit: BigNumber
  isAcceptingDeposits: boolean
  keepApr: BigNumber
}

export type PoolDataHookReturnType = [PoolDataType | null, UserShareType | null]

type PoolDataPoint = [number, string, number]

function getClosestDataPointInPoolStats(
  poolStats: PoolDataPoint[] | undefined,
  blockNumber: number,
): PoolDataPoint | null {
  if (!poolStats) {
    return null
  }
  let closestPoint = poolStats[0]
  for (const poolDataPoint of poolStats) {
    if (poolDataPoint[0] > blockNumber) {
      break
    }
    closestPoint = poolDataPoint
  }
  return closestPoint
}

export default function usePoolData(
  poolName: PoolName,
): PoolDataHookReturnType {
  const { account, library } = useActiveWeb3React()
  const swapContract = useSwapContract(poolName)
  const tokenContracts = useAllContracts()
  const [poolData, setPoolData] = useState<PoolDataHookReturnType>([null, null])
  const [poolStats, setPoolStats] = useState()
  const { tokenPricesUSD, lastTransactionTimes } = useSelector(
    (state: AppState) => state.application,
  )
  const lastDepositTime = lastTransactionTimes[TRANSACTION_TYPES.DEPOSIT]
  const lastWithdrawTime = lastTransactionTimes[TRANSACTION_TYPES.WITHDRAW]
  const lastSwapTime = lastTransactionTimes[TRANSACTION_TYPES.SWAP]

  useEffect(() => {
    ;(async function (): Promise<void> {
      const req = await fetch(
        "https://mehmeta-team-bucket.storage.fleek.co/pool-stats-dev.json?t=" +
          +new Date(),
      )
      const data = await req.json()
      setPoolStats(data)
    })()
  }, [])

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
      const [
        userCurrentWithdrawFee,
        swapStorage,
        allowlistAddress,
      ] = await Promise.all([
        swapContract.calculateCurrentWithdrawFee(account || AddressZero),
        swapContract.swapStorage(),
        swapContract.getAllowlist(),
      ])
      const { adminFee, lpToken: lpTokenAddress, swapFee } = swapStorage
      const lpToken = getContract(
        lpTokenAddress,
        LPTOKEN_ABI,
        library,
        account ?? undefined,
      )
      const [userLpTokenBalance, totalLpTokenBalance] = await Promise.all([
        lpToken.balanceOf(account || AddressZero),
        lpToken.totalSupply(),
      ])
      const allowlist = getContract(
        allowlistAddress,
        ALLOWLIST_ABI,
        library,
        account ?? undefined,
      )
      const poolAccountLimit = await allowlist.getPoolAccountLimit(
        swapContract.address,
      )
      const poolLPTokenCap = await allowlist.getPoolCap(swapContract.address)
      const isAcceptingDeposits = poolLPTokenCap.gt(totalLpTokenBalance)

      const totalDeposits = new Array(4)
      totalDeposits.fill(BigNumber.from("0"))
      const totalWithdrawals = new Array(4)
      totalWithdrawals.fill(BigNumber.from("0"))

      // const vp = await swapContract.getVirtualPrice()

      let totalDepositsBTC = null
      let totalDepositsUSD = null
      const totalWithdrawalsBTC = null
      const totalWithdrawalsUSD = null
      const totalProfitBTC = null
      const totalProfitUSD = null

      // Historical deposit data
      if (account && poolStats) {
        totalDepositsUSD = BigNumber.from(0)
        totalDepositsBTC = BigNumber.from(0)

        // eslint-disable-next-line new-cap
        const liquidityAdditionFilter = swapContract.filters.AddLiquidity()
        liquidityAdditionFilter.topics = liquidityAdditionFilter.topics || []
        liquidityAdditionFilter.topics.push(
          "0x000000000000000000000000" + account.slice(2),
        )
        Object.assign(liquidityAdditionFilter, {
          fromBlock: MAINNET_DEPLOYED_BLOCK,
          toBlock: "latest",
        })

        const liqAdditions = await library.getLogs(liquidityAdditionFilter)
        // Get all hashes of liquidity addition txes
        const liqAdditionTxHashes = liqAdditions.map(
          (log) => log.transactionHash,
        )
        console.log(liqAdditionTxHashes)

        if (tokenContracts.BLPT) {
          // Get the LP token receipt txes
          // eslint-disable-next-line new-cap
          const transferFilter = tokenContracts.BLPT.filters.Transfer()
          Object.assign(transferFilter, {
            fromBlock: MAINNET_DEPLOYED_BLOCK,
            toBlock: "latest",
          })
          if (transferFilter.topics) {
            // No filter on the from address
            transferFilter.topics.push([])
            // To the account address
            transferFilter.topics.push(
              "0x000000000000000000000000" + account.slice(2),
            )
          }

          const tokenReceivings = await library.getLogs(transferFilter)
          // Ensure all token receipts are through liquidity additions
          const tokensReceivedThroughLPLogs = tokenReceivings.filter((log) =>
            liqAdditionTxHashes.includes(log.transactionHash),
          )

          for (const txLog of tokensReceivedThroughLPLogs) {
            // txLog
            const poolStatsDataPoint = getClosestDataPointInPoolStats(
              poolStats,
              txLog.blockNumber,
            )

            if (poolStatsDataPoint) {
              const virtualPriceAtBlock = BigNumber.from(poolStatsDataPoint[1])
              const btcPriceAtBlock = BigNumber.from(poolStatsDataPoint[2])
              const parsedTxLog = tokenContracts.BLPT.interface.parseLog(txLog)
              const depositBTC = parsedTxLog.args.value.mul(virtualPriceAtBlock)

              totalDepositsBTC = totalDepositsBTC.add(depositBTC)
              totalDepositsUSD = totalDepositsUSD.add(
                depositBTC.mul(btcPriceAtBlock),
              )
            }
          }

          console.log(formatUnits(totalDepositsBTC, 36))
          console.log(formatUnits(totalDepositsUSD, 36))
          console.log(totalWithdrawalsBTC)
          console.log(totalWithdrawalsUSD)
          console.log(totalProfitBTC)
          console.log(totalProfitUSD)
        }

        /*
        console.log(liqAdditionTxHashes)
        console.log(liqAdditions
          .map((log) => swapContract.interface.parseLog(log)))
        totalDeposits = liqAdditions
          .map((log) => swapContract.interface.parseLog(log).args.tokenAmounts)
          .reduce((amounts, amountArray) => {
            for (const i of [0, 1, 2, 3]) {
              amounts[i].add(amountArray[i])
            }
            return amounts
          }, totalDeposits)
          console.log('totalDeposits')
        console.log(totalDeposits)
        */
      }

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
      // (weeksPerYear * KEEPPerWeek * KEEPPrice) / (BTCPrice * BTCInPool)
      const comparisonPoolToken = POOL_TOKENS[0]
      const keepAPRNumerator = BigNumber.from(52 * 125000)
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
        totalLocked: tokenBalancesSum,
        virtualPrice: virtualPrice,
        adminFee: adminFee,
        swapFee: swapFee,
        volume: "XXX", // TODO
        utilization: "XXX", // TODO
        apy: "XXX", // TODO
        poolAccountLimit,
        isAcceptingDeposits,
        keepApr,
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
            totalDeposits,
          }
        : null
      setPoolData([poolData, userShareData])
    }
    getSwapData()
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
    poolStats,
  ])

  return poolData
}
