import { ChainId } from "../constants/networks"

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
    case ChainId.KAVA:
      chainScanDomain = "explorer.kava.io"
      if (type === "token") {
        type = "address" // Kava uses the address keyword instead of token
      }
      break
    case ChainId.AURORA:
      chainScanDomain = "explorer.mainnet.aurora.dev"
      break
    default:
      chainScanDomain = "etherscan.io"
  }

  return `https://${chainScanDomain}/${type}/${data}`
}

export function getEtherscanLink(
  data: string,
  type: "tx" | "token" | "address" | "block",
): string {
  return `https://etherscan.io/${type}/${data}`
}
