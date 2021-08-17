import { BaseProvider, InfuraProvider } from "@ethersproject/providers"

export default function getLibrary(): BaseProvider {
  const library = new InfuraProvider()
  library.pollingInterval = 15000
  return library
}
