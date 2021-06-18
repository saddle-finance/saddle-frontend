import { ChainId, TOKENS_MAP, VETH2_SWAP_ADDRESSES } from "../constants"
import { formatUnits, parseUnits } from "@ethersproject/units"

import { AppDispatch } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import SWAP_ABI from "../constants/abis/swapFlashLoan.json"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { Web3Provider } from "@ethersproject/providers"
import { getContract } from "./index"
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

export default function fetchTokenPricesUSD(
  dispatch: AppDispatch,
  chainId?: ChainId,
  library?: Web3Provider,
): void {
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
        .then(async (body: CoinGeckoReponse) => {
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
          const vEth2Price = await getVeth2Price(result?.ETH, chainId, library)
          if (vEth2Price) {
            result.VETH2 = vEth2Price
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
