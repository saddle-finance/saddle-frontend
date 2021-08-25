import {
  ExternalProvider,
  JsonRpcFetchFunc,
  Web3Provider,
} from "@ethersproject/providers"

export default function getLibrary(
  provider: ExternalProvider | JsonRpcFetchFunc,
): Web3Provider {
  const library = new Web3Provider(provider, "any")
  library.pollingInterval = 15000
  return library
}
