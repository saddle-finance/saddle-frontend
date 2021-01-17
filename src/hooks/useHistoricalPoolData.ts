import { DEPLOYED_BLOCK, POOL_STATS_URL, PoolName } from "../constants"
import { useAllContracts, useSwapContract } from "./useContract"
import { useEffect, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { EventFilter } from "@ethersproject/contracts"
import { Web3Provider } from "@ethersproject/providers"
import { useActiveWeb3React } from "."
import usePoolData from "./usePoolData"
import { useSelector } from "react-redux"

export interface HistoricalPoolDataType {
  name: string
  totalDepositsUSD: BigNumber
  totalWithdrawalsUSD: BigNumber
  totalProfitUSD: BigNumber
  totalDepositsBTC: BigNumber
  totalWithdrawalsBTC: BigNumber
  totalProfitBTC: BigNumber
}

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

async function getEventHashes(
  library: Web3Provider,
  account: string,
  eventFilter: EventFilter,
  fromBlock: number,
): Promise<Array<string>> {
  eventFilter.topics = eventFilter.topics || []
  eventFilter.topics.push("0x000000000000000000000000" + account.slice(2))
  Object.assign(eventFilter, {
    fromBlock,
    toBlock: "latest",
  })
  // Get all hashes of liquidity addition txes
  const events = await library.getLogs(eventFilter)
  return events.map((log) => log.transactionHash)
}

export default function useHistoricalPoolData(
  poolName: PoolName,
): HistoricalPoolDataType | null {
  const { account, library, chainId } = useActiveWeb3React()
  const [poolData, userShareData] = usePoolData(poolName)
  const swapContract = useSwapContract(poolName)
  const tokenContracts = useAllContracts()
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)

  const [
    historicalPoolData,
    setHistoricalPoolData,
  ] = useState<HistoricalPoolDataType | null>(null)
  const [poolStats, setPoolStats] = useState()
  const deployedBlock = chainId ? DEPLOYED_BLOCK[chainId] : 0
  const poolStatsURL = chainId ? POOL_STATS_URL[chainId] : null

  useEffect(() => {
    ;(async function (): Promise<void> {
      // TODO don't set it if this fails!
      const req = await fetch(`${poolStatsURL}?t=${+new Date()}`)
      const data = await req.json()
      setPoolStats(data)
    })()
  }, [poolStatsURL])

  useEffect(() => {
    async function setData(): Promise<void> {
      if (
        !account ||
        !library ||
        !poolName ||
        !swapContract ||
        !tokenContracts ||
        !poolStats ||
        !tokenContracts.BLPT ||
        !poolData ||
        !poolStatsURL ||
        !userShareData ||
        !tokenPricesUSD ||
        !tokenPricesUSD.BTC
      )
        return

      // const vp = await swapContract.getVirtualPrice()
      let totalDepositsBTC = BigNumber.from(0)
      let totalDepositsUSD = BigNumber.from(0)
      let totalWithdrawalsBTC = BigNumber.from(0)
      let totalWithdrawalsUSD = BigNumber.from(0)
      let totalProfitBTC = BigNumber.from(0)
      let totalProfitUSD = BigNumber.from(0)

      const blockFilter = {
        fromBlock: deployedBlock,
        toBlock: "latest",
      }

      const addLiquidityHashes = await getEventHashes(
        library,
        account,
        // eslint-disable-next-line new-cap
        swapContract.filters.AddLiquidity(),
        deployedBlock,
      )

      const removeLiquidityHashes = await getEventHashes(
        library,
        account,
        // eslint-disable-next-line new-cap
        swapContract.filters.RemoveLiquidity(),
        deployedBlock,
      )

      const removeLiquidityOneHashes = await getEventHashes(
        library,
        account,
        // eslint-disable-next-line new-cap
        swapContract.filters.RemoveLiquidityOne(),
        deployedBlock,
      )

      const removeLiquidityImbalanceHashes = await getEventHashes(
        library,
        account,
        // eslint-disable-next-line new-cap
        swapContract.filters.RemoveLiquidityImbalance(),
        deployedBlock,
      )
      const allLiquidityRemovalHashes = [
        ...removeLiquidityHashes,
        ...removeLiquidityOneHashes,
        ...removeLiquidityImbalanceHashes,
      ]

      // Deposits
      // Get the LP token receipt txes
      // eslint-disable-next-line new-cap
      const receiptTransferFilter = tokenContracts.BLPT.filters.Transfer()
      Object.assign(receiptTransferFilter, blockFilter)
      if (receiptTransferFilter.topics) {
        // No filter on the from address
        receiptTransferFilter.topics.push([])
        // To the account address
        receiptTransferFilter.topics.push(
          "0x000000000000000000000000" + account.slice(2),
        )
      }
      const tokenReceivings = await library.getLogs(receiptTransferFilter)
      // Ensure all token receipts are through liquidity additions
      const tokensReceivedThroughLPLogs = tokenReceivings.filter((log) =>
        addLiquidityHashes.includes(log.transactionHash),
      )
      // TODO be more defensive here, even if the poolStats data is corrupt in
      // the worst possible way, it shouldn't break deposit/withdrawal pages
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

      // Withdrawals
      // eslint-disable-next-line new-cap
      const sentTransferFilter = tokenContracts.BLPT.filters.Transfer()
      Object.assign(sentTransferFilter, blockFilter)
      if (sentTransferFilter.topics) {
        // From address
        sentTransferFilter.topics.push(
          "0x000000000000000000000000" + account.slice(2),
        )
      }
      const tokenSentLogs = await library.getLogs(sentTransferFilter)
      const tokenSentForLiquidityRemovalLogs = tokenSentLogs.filter((log) =>
        allLiquidityRemovalHashes.includes(log.transactionHash),
      )

      for (const txLog of tokenSentForLiquidityRemovalLogs) {
        const poolStatsDataPoint = getClosestDataPointInPoolStats(
          poolStats,
          txLog.blockNumber,
        )
        if (poolStatsDataPoint) {
          const virtualPriceAtBlock = BigNumber.from(poolStatsDataPoint[1])
          const btcPriceAtBlock = BigNumber.from(poolStatsDataPoint[2])
          const parsedTxLog = tokenContracts.BLPT.interface.parseLog(txLog)
          const withdrawalBTC = parsedTxLog.args.value.mul(virtualPriceAtBlock)

          totalWithdrawalsBTC = totalWithdrawalsBTC.add(withdrawalBTC)
          totalWithdrawalsUSD = totalWithdrawalsUSD.add(
            withdrawalBTC.mul(btcPriceAtBlock),
          )
        }
      }

      const currentUserValueBTC = userShareData.lpTokenBalance.mul(
        poolData.virtualPrice,
      )
      const currentUserValueUSD = currentUserValueBTC.mul(
        BigNumber.from(tokenPricesUSD.BTC),
      )

      totalProfitBTC = currentUserValueBTC
        .add(totalWithdrawalsBTC)
        .sub(totalDepositsBTC)
      totalProfitUSD = currentUserValueUSD
        .add(totalWithdrawalsUSD)
        .sub(totalDepositsUSD)

      setHistoricalPoolData({
        name: poolName,
        totalDepositsUSD,
        totalWithdrawalsUSD,
        totalProfitUSD,
        totalDepositsBTC,
        totalWithdrawalsBTC,
        totalProfitBTC,
      })
    }
    setData()
  }, [
    poolName,
    swapContract,
    tokenContracts,
    account,
    library,
    poolStats,
    poolData,
    userShareData,
    tokenPricesUSD,
    deployedBlock,
    poolStatsURL,
  ])

  return historicalPoolData
}
