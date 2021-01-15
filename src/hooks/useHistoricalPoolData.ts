import { DEPLOYED_BLOCK, PoolName } from "../constants"
import { EventFilter } from "@ethersproject/contracts"
import { formatUnits, parseUnits } from "@ethersproject/units"
import { useAllContracts, useSwapContract } from "./useContract"
import { useEffect, useState } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import { getContract } from "../utils"
import { Web3Provider } from "@ethersproject/providers"
import { useActiveWeb3React } from "."

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

async function getEventHashes(library: Web3Provider, account: string, eventFilter: EventFilter, fromBlock: number) {

      eventFilter.topics = eventFilter.topics || []
      eventFilter.topics.push(
        "0x000000000000000000000000" + account.slice(2),
      )
      Object.assign(eventFilter, {
        fromBlock,
        toBlock: "latest",
      })
      // Get all hashes of liquidity addition txes
      const events = await library.getLogs(eventFilter)
      return events.map(
        (log) => log.transactionHash,
      )
}

export default function useHistoricalPoolData(
  poolName: PoolName,
): HistoricalPoolDataType | undefined {
  const { account, library, chainId } = useActiveWeb3React()
  const swapContract = useSwapContract(poolName)
  const tokenContracts = useAllContracts()

  const [
    historicalPoolData,
    setHistoricalPoolData,
  ] = useState<HistoricalPoolDataType>()
  const [poolStats, setPoolStats] = useState()
  const deployedBlock = chainId ? DEPLOYED_BLOCK[chainId] : 0

  useEffect(() => {
    ;(async function (): Promise<void> {
      // TODO don't set it if this fails!
      const req = await fetch(
        "https://mehmeta-team-bucket.storage.fleek.co/pool-stats-dev.json?t=" +
          +new Date(),
      )
      const data = await req.json()
      setPoolStats(data)
    })()
  }, [])

  useEffect(() => {
    async function setData(): Promise<void> {
      if (
        !account ||
        !library ||
        !poolName ||
        !swapContract ||
        !tokenContracts ||
        !poolStats ||
        !tokenContracts.BLPT
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

      const addLiquidityHashes = await getEventHashes(library, account, swapContract.filters.AddLiquidity(), deployedBlock)
      
      const removeLiquidityHashes = await getEventHashes(library, account,swapContract.filters.RemoveLiquidity(), deployedBlock)

      const removeLiquidityOneHashes = await getEventHashes(library, account,swapContract.filters.RemoveLiquidityOne(), deployedBlock)
      
      const removeLiquidityImbalanceHashes = await getEventHashes(library, account,swapContract.filters.RemoveLiquidityImbalance(), deployedBlock)
      const allLiquidityRemovalHashes = [...removeLiquidityHashes, ...removeLiquidityOneHashes, ...removeLiquidityImbalanceHashes]

      console.log('addLiquidityHashes')
      console.log(addLiquidityHashes)
      console.log('removeLiquidityHashes')
      console.log(removeLiquidityHashes)
      console.log('removeLiquidityOneHashes')
      console.log(removeLiquidityOneHashes)
      console.log('removeLiquidityImbalanceHashes')
      console.log(removeLiquidityImbalanceHashes)
      console.log('allLiquidityRemovalHashes')
      console.log(allLiquidityRemovalHashes)

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
      console.log('tokenSentForLiquidityRemovalLogs')
      console.log(tokenSentForLiquidityRemovalLogs)

      for (const txLog of tokenSentForLiquidityRemovalLogs) {
        // txLog
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

      

      console.log(formatUnits(totalDepositsBTC, 36))
      console.log(formatUnits(totalDepositsUSD, 36))
      console.log(totalWithdrawalsBTC)
      console.log(totalWithdrawalsUSD)
      console.log(totalProfitBTC)
      console.log(totalProfitUSD)

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
  }, [poolName, swapContract, tokenContracts, account, library, poolStats])

  return historicalPoolData
}
