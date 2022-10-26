import { BasicPool, BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { BasicToken, TokensContext } from "../providers/TokensProvider"
import {
  Box,
  Button,
  Link,
  List,
  ListItem,
  Typography,
  useTheme,
} from "@mui/material"
import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import LinkIcon from "@mui/icons-material/Launch"
import { getFormattedShortTime } from "../utils/dateTime"
import { getMultichainScanLink } from "../utils/getEtherscanLink"
import { useActiveWeb3React } from "../hooks"
import { useTranslation } from "react-i18next"

interface Response {
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

interface Transaction {
  object: string
  transaction: string
  time: string
  timestamp: number
  status?: string
}

export default function Transactions(): ReactElement {
  const SADDLE_SUBGRAPH_URL =
    "https://api.thegraph.com/subgraphs/name/saddle-finance/saddle"
  const { t } = useTranslation()
  const theme = useTheme()
  const basicPools = useContext(BasicPoolsContext)
  const tokens = useContext(TokensContext)
  const { chainId, account } = useActiveWeb3React()
  const [transactionList, setTransactionList] = useState<Transaction[]>([])
  const basicPoolsByAddress = useMemo(
    () =>
      Object.values(basicPools || {}).reduce(
        (acc, basicPool) => ({ ...acc, [basicPool.poolAddress]: basicPool }),
        {} as { [address: string]: BasicPool },
      ),
    [basicPools],
  )

  const fetchTxn = useCallback(async () => {
    if (!account || !chainId) return

    const newTransactionList: Transaction[] = []
    const time24Hrs = Math.floor(Date.now() / 1000) - 60 * 60 * 24 // 24hrs
    const query = `
      {
        addLiquidityEvents(where:{provider: "${account}", timestamp_gte: ${time24Hrs}}) {
          swap {
            id
          }
          transaction
          timestamp
        }
        removeLiquidityEvents(where:{provider:"${account}", timestamp_gte: ${time24Hrs}}) {
          swap {
            id
          }
          transaction
          timestamp
        }
        swaps {
          address
          exchanges(where:{buyer:"${account}", timestamp_gte: ${time24Hrs}}) {
            boughtId
            soldId
            timestamp
            transaction
          }
        }
      }
    `

    await fetch(SADDLE_SUBGRAPH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((result: Response) => {
        const { addLiquidityEvents, removeLiquidityEvents, swaps } = result.data
        addLiquidityEvents.map((event) => {
          const poolAddress = event.swap.id.toLowerCase()
          const poolName = basicPoolsByAddress?.[poolAddress]?.poolName
          if (poolName) {
            newTransactionList.push({
              object: `${t("depositIn")} ${poolName}`,
              transaction: event.transaction,
              time: getFormattedShortTime(event.timestamp),
              timestamp: parseInt(event.timestamp),
            })
          }
        })

        removeLiquidityEvents.map((event) => {
          const poolAddress = event.swap.id.toLowerCase()
          const poolName = basicPoolsByAddress?.[poolAddress]?.poolName
          if (poolName) {
            newTransactionList.push({
              object: `${t("withdrawFrom")} ${poolName}`,
              transaction: event.transaction,
              time: getFormattedShortTime(event.timestamp),
              timestamp: parseInt(event.timestamp),
            })
          }
        })

        swaps.map(({ address, exchanges }) => {
          const basicPool = basicPoolsByAddress?.[address.toLowerCase()]
          const tokenAddresses =
            basicPool?.underlyingTokens || basicPool?.tokens || []
          const poolTokens = tokenAddresses.map(
            (tokenAddr) => tokens?.[tokenAddr],
          ) as BasicToken[]
          if (exchanges && poolTokens) {
            exchanges.map(({ soldId, boughtId, transaction, timestamp }) => {
              const soldToken = poolTokens[parseInt(soldId)].address
              const boughtToken = poolTokens[parseInt(boughtId)].address
              const message =
                soldToken && boughtToken
                  ? `${t("swap")} ${soldToken} ${t("toBe")} ${boughtToken}`
                  : t("swap")

              newTransactionList.push({
                object: message,
                transaction: transaction,
                time: getFormattedShortTime(timestamp),
                timestamp: parseInt(timestamp),
              })
            })
          }
        })
        setTransactionList(
          newTransactionList.sort((a, b) => b.timestamp - a.timestamp),
        )
      })
      .catch(console.error)
  }, [account, chainId, basicPoolsByAddress, t, tokens])

  useEffect(() => {
    void fetchTxn()
  }, [fetchTxn])

  return (
    <>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="subtitle1">{t("recentTransactions")}</Typography>
        <Button
          onClick={(): void => {
            setTransactionList([])
          }}
        >
          <Typography
            variant="body2"
            color={theme.palette.getContrastText(
              theme.palette.background.paper,
            )}
          >
            {t("clear")}
          </Typography>
        </Button>
      </Box>
      <List>
        {chainId && transactionList.length !== 0 ? (
          transactionList.map((txn, index) => (
            <ListItem key={index} disableGutters>
              <Typography marginRight={1}>{txn.object}</Typography>
              <Link
                href={getMultichainScanLink(chainId, txn.transaction, "tx")}
                target="_blank"
                rel="noreferrer"
                sx={{ lineHeight: 0 }}
              >
                <LinkIcon sx={{ fontSize: 16 }} />
              </Link>
              <Typography sx={{ flex: 1 }} textAlign="end">
                {txn.time}
              </Typography>
            </ListItem>
          ))
        ) : (
          <Typography style={{ fontSize: "16px" }}>
            {t("yourRecentTransactions")}
          </Typography>
        )}
      </List>
    </>
  )
}
