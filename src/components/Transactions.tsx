import React, { ReactElement, useCallback, useEffect } from "react"
// import retry from "async-retry"

interface AddLiqudityResponse {
  data: {
    swap: {
      id: string
      tokenAmounts: Array<string>
      transaction: string
    }
  }
}

interface Props {
  account: string
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
      tokenAmounts
    }
    removeLiquidityEvents(where:{provider:"${account}"}) {
      swap {
        id
      }
      transaction
      timestamp
      tokenAmounts
    }
    swaps {
       exchanges(where:{buyer:"${account}"}) {
        boughtId
        tokensBought
        soldId
        tokensSold
      }
    }
  }
  `
  const url = "https://api.thegraph.com/subgraphs/name/saddle-finance/saddle"

  const fetchTxn = useCallback(async () => {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((result: AddLiqudityResponse) => {
        console.log(result.data)
      })
      .catch(console.error)
  }, [query])

  useEffect(() => {
    void fetchTxn()
  }, [fetchTxn])

  return <></>
}
