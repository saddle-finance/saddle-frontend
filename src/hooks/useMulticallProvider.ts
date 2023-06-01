import { UseQueryResult, useQuery } from "@tanstack/react-query"

import { MulticallProvider } from "../types/ethcall"
import { getMulticallProvider } from "../utils"
import { useActiveWeb3React } from "../hooks"

export const useMulticallProvider = (): UseQueryResult<MulticallProvider> => {
  const { chainId, signerOrProvider } = useActiveWeb3React()

  return useQuery(["multicallProvider"], async () => {
    if (!signerOrProvider || !chainId)
      throw new Error("signerOrProvider or chainId not found")

    return await getMulticallProvider(chainId)
  })
}
