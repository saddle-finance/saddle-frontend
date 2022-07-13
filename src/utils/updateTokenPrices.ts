import { BasicToken, BasicTokens } from "../providers/TokensProvider"
import {
  COINGECKO_PLATFORM_ID,
  SUPPORTED_NETWORKS,
} from "../constants/networks"
import { ChainId, PoolTypes } from "../constants"
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
export const getTokenPrice = async (
  dispatch: AppDispatch,
  tokens: BasicTokens,
  chainId?: ChainId,
  sdlWethSushiPool?: SdlWethSushiPool,
): Promise<void> => {
  if (!tokens || !chainId) return
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
      const sdlPerEth = sdlWethSushiPool?.wethReserve
        ? sdlWethSushiPool?.sdlReserve
            ?.mul(BN_1E18)
            .div(sdlWethSushiPool.wethReserve)
        : Zero
      if (!tokenPricesUSD.SDL && sdlPerEth) {
        tokenPricesUSD.SDL =
          (tokenPricesUSD?.ETH || 0) / parseFloat(formatUnits(sdlPerEth, 18))
      }
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
