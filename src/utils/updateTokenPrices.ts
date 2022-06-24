import { BasicToken, BasicTokens } from "../providers/TokensProvider"
import {
  COINGECKO_PLATFORM_ID,
  SUPPORTED_NETWORKS,
} from "../constants/networks"
import { ChainId, PoolTypes, SDL_TOKEN, SPA, TOKENS_MAP } from "../constants"
import { TokenPricesUSD, updateTokensPricesUSD } from "../state/application"

import { AppDispatch } from "../state"
import { BN_1E18 } from "./../constants/index"
import { SdlWethSushiPool } from "../state/application"
import { Zero } from "@ethersproject/constants"
import { arrayToHashmap } from "./index"
import { chunk } from "lodash"
import { formatUnits } from "@ethersproject/units"
import retry from "async-retry"

const coinGeckoAPI = "https://api.coingecko.com/api/v3/simple/price"

const nativeTokenID = ["bitcoin", "ethereum"]

const MAX_ADDRESSES_PER_COINGECKO_REQUEST = 30
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
  T: "threshold-network-token",
  [SDL_TOKEN.symbol]: SDL_TOKEN.geckoId,
  [SPA.symbol]: SPA.geckoId,
}

export default function fetchTokenPricesUSD(
  dispatch: AppDispatch,
  sdlWethSushiPool?: SdlWethSushiPool,
  chainId?: ChainId,
): void {
  const tokens = Object.values(TOKENS_MAP).filter(({ addresses }) =>
    chainId ? addresses[chainId] : false,
  )
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
              const price = body?.[otherTokens[key]]?.usd
              return price
                ? {
                    ...acc,
                    [key]: price,
                  }
                : acc
            },
            {} as { [symbol: string]: number },
          )
          const result = tokens.reduce((acc, token) => {
            return { ...acc, [token.symbol]: body?.[token.geckoId]?.usd }
          }, otherTokensResult)
          result.alETH = result?.ETH || result?.alETH || 0 // TODO: remove once CG price is fixed
          result.nUSD = 1
          result.VETH2 = result?.ETH || 0
          const sdlPerEth = sdlWethSushiPool?.wethReserve
            ? sdlWethSushiPool?.sdlReserve
                ?.mul(BN_1E18)
                .div(sdlWethSushiPool.wethReserve)
            : Zero
          if (!result.SDL && sdlPerEth) {
            result.SDL =
              (result?.ETH || 0) / parseFloat(formatUnits(sdlPerEth, 18))
            console.log({ sdlPerEth, sdl: result.SDL })
          }
          dispatch(updateTokensPricesUSD(result))
        }),
    { retries: 3 },
  )
}

export const getTokenPrice = async (
  tokens: BasicTokens,
  dispatch: AppDispatch,
  chainId: ChainId,
): Promise<void> => {
  if (!tokens) return
  const tokenAddresses = Object.keys(tokens)
  const platform = COINGECKO_PLATFORM_ID[chainId]
  const addressesChunk = chunk(
    tokenAddresses,
    MAX_ADDRESSES_PER_COINGECKO_REQUEST,
  )
  if (SUPPORTED_NETWORKS[chainId] && platform) {
    try {
      const pricesChunks = await Promise.all(
        addressesChunk.map((chunkedAddress) =>
          retry(
            () =>
              fetch(
                `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${chunkedAddress.join(
                  ",",
                )}&vs_currencies=usd`,
              )
                .then((res) => res.json())
                .then((prices: CoinGeckoReponse) =>
                  arrayToHashmap(
                    Array.from(
                      Object.entries(prices).map(
                        ([address, { usd: usdPrice }]) => [
                          (tokens[address] as BasicToken).symbol,
                          usdPrice,
                        ],
                      ),
                    ),
                  ),
                ),
            { retries: 3 },
          ),
        ),
      )

      const tokenPricesUSD = Object.assign(
        {},
        ...pricesChunks,
      ) as TokenPricesUSD
      dispatch(updateTokensPricesUSD(tokenPricesUSD))
    } catch (error) {
      console.error("Error on fetching price from coingecko ==>", error)
    }
  } else {
    try {
      void retry(
        () =>
          fetch(`${coinGeckoAPI}?ids=${encodeURIComponent(
            nativeTokenID.join(","),
          )}&vs_currencies=usd
    `)
            .then((res) => res.json())
            .then((data: CoinGeckoReponse) => {
              const nativeTokenPrice = {
                btc: data.bitcoin.usd,
                eth: data.ethereum.usd,
              }
              const tokenPricesUSD = Object.assign(
                {},
                ...Object.keys(tokens).map((tokenAddress) => {
                  switch (tokens[tokenAddress]?.typeAsset) {
                    case PoolTypes.BTC:
                      return {
                        [(tokens[tokenAddress] as BasicToken).symbol]:
                          nativeTokenPrice.btc,
                      }
                    case PoolTypes.ETH:
                      return {
                        [(tokens[tokenAddress] as BasicToken).symbol]:
                          nativeTokenPrice.eth,
                      }
                    case PoolTypes.USD:
                      return {
                        [(tokens[tokenAddress] as BasicToken).symbol]: 1,
                      }
                    default:
                      return {
                        [(tokens[tokenAddress] as BasicToken).symbol]: 100, //100 is fake price for OTHER or "unknown" token
                      }
                  }
                }),
              ) as TokenPricesUSD
              dispatch(updateTokensPricesUSD(tokenPricesUSD))
            }),
        { retries: 3 },
      )
    } catch (error) {
      console.error("Error on fetching price from coingecko ==>", error)
    }
  }
}
