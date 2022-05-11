import { ChainId } from "../constants"

export function getMultichainScanLink(
  chainId: ChainId,
  data: string,
  type: "tx" | "token" | "address" | "block" | "txs",
): string {
  let chainScanDomain = "etherscan.io"
  switch (chainId) {
    case ChainId.MAINNET:
      chainScanDomain = "etherscan.io"
      break
    case ChainId.ARBITRUM:
      chainScanDomain = "arbiscan.io"
      break
    case ChainId.FANTOM:
      chainScanDomain = "ftmscan.com"
      break
    case ChainId.OPTIMISM:
      chainScanDomain = "optimistic.etherscan.io"
      break
    case ChainId.EVMOS || ChainId.EVMOS_TESTNET:
      chainScanDomain = "evm.evmos.org"
      break
    case ChainId.KAVA_TESTNET:
      chainScanDomain = "explorer.evm-alpha.kava.io"
      break
    default:
      chainScanDomain = "etherscan"
  }

  return `https://${chainScanDomain}/${type}/${data}`
}

export function getEtherscanLink(
  data: string,
  type: "tx" | "token" | "address" | "block",
): string {
  return `https://etherscan.io/${type}/${data}`
}
