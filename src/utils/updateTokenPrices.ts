import { BasicToken, BasicTokens } from "../providers/TokensProvider"
import {
  ChainId,
  PoolTypes,
  SPA,
  TOKENS_MAP,
  VETH2_SWAP_ADDRESSES,
} from "../constants"
import { TokenPricesUSD, updateTokensPricesUSD } from "../state/application"
import { arrayToHashmap, getContract } from "./index"
import { formatUnits, parseUnits } from "@ethersproject/units"

import { AppDispatch } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { SUPPORTED_NETWORKS } from "../constants/networks"
import SWAP_ABI from "../constants/abis/swapFlashLoan.json"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { Web3Provider } from "@ethersproject/providers"
import { chunk } from "lodash"
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
  [SPA.symbol]: SPA.geckoId,
}

export default function fetchTokenPricesUSD(
  dispatch: AppDispatch,
  chainId?: ChainId,
  library?: Web3Provider,
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
        .then(async (body: CoinGeckoReponse) => {
          const otherTokensResult = Object.keys(otherTokens).reduce(
            (acc, key) => {
              return {
                ...acc,
                [key]: body?.[otherTokens[key]].usd,
              }
            },
            {} as { [symbol: string]: number },
          )
          const result = tokens.reduce((acc, token) => {
            return { ...acc, [token.symbol]: body?.[token.geckoId]?.usd }
          }, otherTokensResult)
          result.alETH = result?.ETH || result.alETH || 0 // TODO: remove once CG price is fixed
          result.nUSD = 1
          if (chainId === ChainId.MAINNET) {
            const vEth2Price = await getVeth2Price(
              result?.ETH,
              chainId,
              library,
            )
            result.VETH2 = vEth2Price || result?.ETH | 0
          }
          dispatch(updateTokensPricesUSD(result))
        }),
    { retries: 3 },
  )
}

async function getVeth2Price(
  etherPrice: number,
  chainId?: ChainId,
  library?: Web3Provider,
): Promise<number> {
  if (!etherPrice || !library) return 0
  try {
    const swapContract = getContract(
      chainId ? VETH2_SWAP_ADDRESSES[chainId] : "",
      SWAP_ABI,
      library,
    ) as SwapFlashLoan
    const veth2ToEthRate = await swapContract.calculateSwap(
      1,
      0,
      BigNumber.from(10).pow(18),
    )
    const eth = parseUnits(etherPrice.toString(), 18)
    const vEth2Price = parseFloat(formatUnits(veth2ToEthRate.mul(eth), 36))
    return vEth2Price
  } catch (e) {
    console.error(e)
    return etherPrice
  }
}

export const getTokenPrice = async (
  tokens: BasicTokens,
  dispatch: AppDispatch,
  chainId: ChainId,
): Promise<void> => {
  if (!tokens) return
  const tokenAddresses = Object.keys(tokens)
  const platform = SUPPORTED_NETWORKS[chainId]?.coingeckoPlatformID
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
