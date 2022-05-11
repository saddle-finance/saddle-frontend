import { ChainId } from "../constants"

export function getMultichainScanLink(
  chainId: ChainId,
  data: string,
  type: "tx" | "token" | "address" | "block" | "txs",
): string {
  let chainScanBaseName = "etherscan.io"
  switch (chainId) {
    case ChainId.MAINNET:
      chainScanBaseName = "etherscan.io"
      break
    case ChainId.ARBITRUM:
      chainScanBaseName = "arbiscan.io"
      break
    case ChainId.FANTOM:
      chainScanBaseName = "ftmscan.com"
      break
    case ChainId.OPTIMISM:
      chainScanBaseName = "optimistic.etherscan.io"
      break
    case ChainId.EVMOS || ChainId.EVMOS_TESTNET:
      chainScanBaseName = "mintscan.io"
      break
    case ChainId.KAVA_TESTNET:
      chainScanBaseName = "explorer.evm-alpha.kava.io"
      break
    default:
      chainScanBaseName = "etherscan"
  }

  return `https://${chainScanBaseName}/${type}/${data}`
}

export function getEtherscanLink(
  data: string,
  type: "tx" | "token" | "address" | "block",
): string {
  return `https://etherscan.io/${type}/${data}`
}
