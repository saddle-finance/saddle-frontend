import { ChainId } from "../constants"

export function getMultichainScanLink(
  chainId: ChainId,
  data: string,
  type: "tx" | "token" | "address" | "block" | "txs",
): string {
  let chainScanBaseName = "etherscan"
  switch (chainId) {
    case ChainId.MAINNET:
      chainScanBaseName = "etherscan"
      break
    case ChainId.ARBITRUM:
      chainScanBaseName = "arbiscan"
      break
    case ChainId.FANTOM:
      chainScanBaseName = "ftmscan"
      break
    case ChainId.OPTIMISM:
      chainScanBaseName = "optimistic.etherscan"
      break
    case ChainId.EVMOS || ChainId.EVMOS_TESTNET:
      chainScanBaseName = "mintscan"
      break
    default:
      chainScanBaseName = "etherscan"
  }

  return `https://${chainScanBaseName}.io/${type}/${data}`
}

export function getEtherscanLink(
  data: string,
  type: "tx" | "token" | "address" | "block",
): string {
  return `https://etherscan.io/${type}/${data}`
}
