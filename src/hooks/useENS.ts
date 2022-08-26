import { UseQueryResult, useQuery } from "@tanstack/react-query"

import { ChainId } from "../constants"
import { ethers } from "ethers"
import { useActiveWeb3React } from "."

type ENS = string | null

export const useENS = (address: string): UseQueryResult<ENS> => {
  const { library, chainId } = useActiveWeb3React()

  return useQuery(["ens", address], async () => {
    if (!library || !address) throw new Error("library or address not found")
    if (
      address &&
      library &&
      ethers.utils.isAddress(address) &&
      chainId === ChainId.MAINNET
    ) {
      const ensNameOnMainnet = await library.lookupAddress(address)
      return ensNameOnMainnet
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
      return ensNameOnMainnet
    } else {
      return ""
    }
  })
}
