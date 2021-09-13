import { AppDispatch } from "../state"
import { TOKENS_MAP } from "../constants"
import retry from "async-retry"
import { updateTokensPricesUSD } from "../state/application"

const coinGeckoAPI = "https://api.coingecko.com/api/v3/simple/price"

interface CoinGeckoReponse {
  [tokenSymbol: string]: {
    usd: number
  }
}
const otherTokens = {
  ETH: "ethereum",
  WETH: "ethereum",
  VETH2: "ethereum", // TODO: pull vETH2 price once it's added to coingecko
  BTC: "bitcoin",
  KEEP: "keep-network",
  SGT: "sharedstake-governance-token",
  ALCX: "alchemix",
}

export default function fetchTokenPricesUSD(dispatch: AppDispatch): void {
  const tokens = Object.values(TOKENS_MAP)
  const tokenIds = Array.from(
    new Set(
      tokens.map(({ geckoId }) => geckoId).concat(Object.values(otherTokens)),
    ),
  )
  void retry(
    () =>
      fetch(`${coinGeckoAPI}?ids=${encodeURIComponent(
        tokenIds.join(","),
      )}&vs_currencies=usd
    `)
        .then((res) => res.json())
        .then((body: CoinGeckoReponse) => {
          const otherTokensResult = Object.keys(otherTokens).reduce(
            (acc, key) => {
              return {
                ...acc,
                [key]: body?.[otherTokens[key as keyof typeof otherTokens]].usd,
              }
            },
            {} as { [symbol: string]: number },
          )
          const result = tokens.reduce((acc, token) => {
            return { ...acc, [token.symbol]: body?.[token.geckoId]?.usd }
          }, otherTokensResult)
          result.alETH = result?.ETH || result.alETH || 0 // TODO: remove once CG price is fixed
          dispatch(updateTokensPricesUSD(result))
        }),
    { retries: 3 },
  )
}
