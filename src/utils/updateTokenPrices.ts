import { BTC_POOL_TOKENS, STABLECOIN_POOL_TOKENS } from "../constants"

import { AppDispatch } from "../state"
import retry from "async-retry"
import { updateTokensPricesUSD } from "../state/application"

const coinGeckoAPI = "https://api.coingecko.com/api/v3/simple/price"

interface CoinGeckoReponse {
  [tokenSymbol: string]: {
    usd: number
  }
}

export default function fetchTokenPricesUSD(dispatch: AppDispatch): void {
  const tokens = BTC_POOL_TOKENS.concat(STABLECOIN_POOL_TOKENS)
  const tokenIds = tokens
    .map(({ geckoId }) => geckoId)
    .concat(["ethereum", "bitcoin", "keep-network"])
  void retry(
    () =>
      fetch(`${coinGeckoAPI}?ids=${encodeURIComponent(
        tokenIds.join(","),
      )}&vs_currencies=usd
    `)
        .then((res) => res.json())
        .then((body: CoinGeckoReponse) => {
          const result = tokens.reduce(
            (acc, token) => {
              return { ...acc, [token.symbol]: body?.[token.geckoId]?.usd }
            },
            {
              ETH: body?.ethereum?.usd,
              BTC: body?.bitcoin?.usd,
              KEEP: body?.["keep-network"].usd,
            },
          )
          dispatch(updateTokensPricesUSD(result))
        }),
    { retries: 3 },
  )
}
