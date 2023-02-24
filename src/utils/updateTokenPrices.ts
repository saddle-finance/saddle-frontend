import { BasicToken, BasicTokens } from "../providers/TokensProvider"
import {
  COINGECKO_PLATFORM_ID,
  SUPPORTED_NETWORKS,
} from "../constants/networks"
import { PoolTypes, SDL_TOKEN, SPA, TOKENS_MAP } from "../constants"
import { TokenPricesUSD, updateTokensPricesUSD } from "../state/application"

import { AppDispatch } from "../state"
import { BN_1E18 } from "./../constants/index"
import { ChainId } from "../constants/networks"
import { SdlWethSushiPool } from "../state/application"
import { Zero } from "@ethersproject/constants"
import { arrayToHashmap } from "./index"
import { chunk } from "lodash"
import { formatUnits } from "@ethersproject/units"
import retry from "async-retry"

const coinGeckoAPI = "https://pro-api.coingecko.com/api/v3/simple/price"

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

export function oldFetchTokenPricesUSD(
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
          }
          dispatch(updateTokensPricesUSD(result))
        }),
    { retries: 3 },
  )
}

export default function fetchTokenPricesUSD(
  dispatch: AppDispatch,
  sdlWethSushiPool?: SdlWethSushiPool,
  chainId?: ChainId,
): void {
  if (!chainId) return
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
      fetch(
        `${coinGeckoAPI}?ids=${encodeURIComponent(
          tokenIds.join(","),
        )}&vs_currencies=usd&x_cg_pro_api_key=CG-eCmWRehYgDjzKv1RLyJrEp27
    `,
        { headers: { "Access-Control-Allow-Origin": "*" } },
      )
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
            {} as { [address: string]: number },
          )
          const result = tokens.reduce((acc, token) => {
            return {
              ...acc,
              [token.addresses[chainId].toLowerCase()]:
                body?.[token.geckoId]?.usd,
            }
          }, otherTokensResult)
          // result.alETH = result?.ETH || result?.alETH || 0 // TODO: remove once CG price is fixed
          result.nUSD = 1
          // result.VETH2 = result?.ETH || 0
          const sdlPerEth = sdlWethSushiPool?.wethReserve
            ? sdlWethSushiPool?.sdlReserve
                ?.mul(BN_1E18)
                .div(sdlWethSushiPool.wethReserve)
            : Zero
          const sdlAddrLowercased =
            "0xf1Dc500FdE233A4055e25e5BbF516372BC4F6871".toLowerCase()
          const ethAddrLowercased =
            "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase()
          // same logic as below but w\ addr key
          if (!result[sdlAddrLowercased] && sdlPerEth) {
            result[sdlAddrLowercased] =
              (result[ethAddrLowercased] || 0) /
              parseFloat(formatUnits(sdlPerEth, 18))
          }
          // if (!result.SDL && sdlPerEth) {
          //   result.SDL =
          //     (result?.ETH || 0) / parseFloat(formatUnits(sdlPerEth, 18))
          // }
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
                          (tokens[address] as BasicToken).address,
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
                        [(tokens[tokenAddress] as BasicToken).address]:
                          nativeTokenPrice.btc,
                      }
                    case PoolTypes.ETH:
                      return {
                        [(tokens[tokenAddress] as BasicToken).address]:
                          nativeTokenPrice.eth,
                      }
                    case PoolTypes.USD:
                      return {
                        [(tokens[tokenAddress] as BasicToken).address]: 1,
                      }
                    default:
                      return {
                        [(tokens[tokenAddress] as BasicToken).address]: 100, //100 is fake price for OTHER or "unknown" token
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
