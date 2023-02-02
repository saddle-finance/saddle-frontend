import { useEffect, useState } from "react"

import { ChainId } from "../constants/networks"
import { ethers } from "ethers"
import { useActiveWeb3React } from "."

type ReturnType = { ensName: string | null }

export const useENS = (address: string | null | undefined): ReturnType => {
  const [ensName, setENSName] = useState<string | null>(null)
  const { library, chainId } = useActiveWeb3React()

  useEffect(() => {
    async function resolveENS() {
      if (
        address &&
        library &&
        ethers.utils.isAddress(address) &&
        chainId === ChainId.MAINNET
      ) {
        const ensNameOnMainnet = await library.lookupAddress(address)
        setENSName(ensNameOnMainnet)
      } else if (
        address &&
        library &&
        ethers.utils.isAddress(address) &&
        chainId !== ChainId.MAINNET
      ) {
        // Get ens name from main chain when network is non-mainnet

        const NETWORK_URL = process.env.REACT_APP_NETWORK_URL
        const ensNameOnMainnet = await ethers
          .getDefaultProvider(NETWORK_URL)
          .lookupAddress(address)
        setENSName(ensNameOnMainnet)
      } else {
        setENSName(null)
      }
    }
    resolveENS().catch(console.error)
  }, [address, library, chainId])

  return { ensName }
}
