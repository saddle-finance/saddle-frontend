import { useEffect, useState } from "react"
import { ethers } from "ethers"

type ReturnType = { ensName: string | null }

export const useENS = (address: string | null | undefined): ReturnType => {
  const [ensName, setENSName] = useState<string | null>(null)

  useEffect(() => {
    async function resolveENS() {
      if (address && ethers.utils.isAddress(address)) {
        const provider = new ethers.providers.JsonRpcProvider(
          process.env.REACT_APP_NETWORK_URL,
        )
        const ensName = await provider.lookupAddress(address)
        if (ensName) setENSName(ensName)
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    resolveENS()
  }, [address])

  return { ensName }
}
