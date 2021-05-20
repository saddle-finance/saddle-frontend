import "./Transactions.scss"
import React, { ReactElement, useCallback, useEffect, useState } from "react"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import { getPoolByAddress } from "../utils/getPoolByAddress"
import { useActiveWeb3React } from "../hooks"
import { useTranslation } from "react-i18next"

interface AddLiqudityResponse {
  data: {
    addLiquidityEvents: [
      {
        swap: {
          id: string
        }
        timestamp: string
        transaction: string
      },
    ]
    removeLiquidityEvents: [
      {
        swap: {
          id: string
        }
        timestamp: string
        transaction: string
      },
    ]
    swaps: [
      {
        address: string
        exchanges: [
          {
            boughtId: string
            tokensBought: string
            soldId: string
            tokensSold: string
            timestamp: string
            transaction: string
          },
        ]
      },
    ]
  }
}

interface Props {
  account: string
}

interface Transaction {
  object: string
  transaction: string
  time: string
  timestamp: number
  status?: string
}

export default function Transactions({ account }: Props): ReactElement {
  const query = `
  {
    addLiquidityEvents(where:{provider: "${account}"}) {
      swap {
        id
      }
      transaction
      timestamp
    }
    removeLiquidityEvents(where:{provider:"${account}"}) {
      swap {
        id
      }
      transaction
      timestamp
    }
    swaps {
      address
      exchanges(where:{buyer:"${account}"}) {
        boughtId
        tokensBought
        soldId
        tokensSold
        timestamp
        transaction
      }
    }
  }
  `
  const url = "https://api.thegraph.com/subgraphs/name/saddle-finance/saddle"
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()
  const [transactionList, setTransactionList] = useState<Transaction[]>([])
  type timeOption = {
    [key: string]:
      | "numeric"
      | "2-digit"
      | "long"
      | "short"
      | "narrow"
      | undefined
  }

  const fetchTxn = useCallback(async () => {
    const timeoptions: timeOption = {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((result: AddLiqudityResponse) => {
        const addLiquidityEvents = result.data.addLiquidityEvents
        addLiquidityEvents.map((event) => {
          const poolName = chainId
            ? getPoolByAddress(event.swap.id, chainId)?.name
            : null
          const time = new Date(
            parseInt(event.timestamp) * 1000,
          ).toLocaleTimeString([], timeoptions)
          poolName &&
            setTransactionList((prevState) => [
              ...prevState,
              {
                object: `${t("depositIn")} ${poolName}`,
                transaction: event.transaction,
                time: time,
                timestamp: parseInt(event.timestamp),
              },
            ])
        })

        const removeLiquidityEvents = result.data.removeLiquidityEvents
        removeLiquidityEvents.map((event) => {
          const poolName = chainId
            ? getPoolByAddress(event.swap.id, chainId)?.name
            : null
          const time = new Date(
            parseInt(event.timestamp) * 1000,
          ).toLocaleTimeString([], {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
          poolName &&
            setTransactionList((prevState) => [
              ...prevState,
              {
                object: `${t("withdrawFrom")} ${poolName}`,
                transaction: event.transaction,
                time: time,
                timestamp: parseInt(event.timestamp),
              },
            ])
        })

        const swaps = result.data.swaps
        swaps.map((event) => {
          if (event.exchanges) {
            const poolTokens = chainId
              ? getPoolByAddress(event.address, chainId)?.poolTokens
              : null
            poolTokens &&
              event.exchanges.map((swap) => {
                const time = new Date(
                  parseInt(swap.timestamp) * 1000,
                ).toLocaleTimeString([], timeoptions)

                const soldToken = poolTokens[parseInt(swap.soldId)].name
                const boughtToken = poolTokens[parseInt(swap.boughtId)].name

                setTransactionList((prevState) => [
                  ...prevState,
                  {
                    object: `${t("swap")} ${soldToken} ${t(
                      "toBe",
                    )} ${boughtToken}`,
                    transaction: swap.transaction,
                    time: time,
                    timestamp: parseInt(swap.timestamp),
                  },
                ])
              })
          }
        })
      })
      .catch(console.error)
  }, [query, chainId, t])

  useEffect(() => {
    void fetchTxn()
  }, [fetchTxn])

  return (
    <div className="transactionList">
      {transactionList.map((txn, index) => (
        <div key={index} className="transactionItem">
          <span className="transactionObject">{txn.object}</span>
          <a
            href={getEtherscanLink(txn.transaction, "tx")}
            target="_blank"
            rel="noreferrer"
            className="transactionLink"
          >
            {/* link icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M11.6667 11.6667H4.33333V4.33333H8V3H4.33333C3.59333 3 3 3.6 3 4.33333V11.6667C3 12.4 3.59333 13 4.33333 13H11.6667C12.4 13 13 12.4 13 11.6667V8H11.6667V11.6667ZM9.33333 2V3.33333H11.7267L6.17333 8.88667L7.11333 9.82667L12.6667 4.27333V6.66667H14V2H9.33333Z" />
            </svg>
          </a>
          <span className="transactionTime">{txn.time}</span>
        </div>
      ))}
    </div>
  )
}
