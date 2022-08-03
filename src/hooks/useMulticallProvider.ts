import { UseQueryResult, useQuery } from "@tanstack/react-query"

import { MulticallProvider } from "../types/ethcall"
import { getMulticallProvider } from "../utils"
import { useActiveWeb3React } from "../hooks"

export const useMulticallProvider = (): UseQueryResult<MulticallProvider> => {
  const { chainId, library } = useActiveWeb3React()

  return useQuery(["multicallProvider"], async () => {
    if (!library || !chainId) throw new Error("library or chainId not found")

    return await getMulticallProvider(library, chainId)
  })
}
