import { CHILD_GAUGE_FACTORY_NAME, useMasterRegistry } from "./useContract"
import { UseQueryResult, useQuery } from "@tanstack/react-query"
import { ContractNotLoadedError } from "../errors/ContractNotLoadedError"
import { QueryKeys } from "./queryKeys"
import { formatBytes32String } from "ethers/lib/utils"
import { shouldLoadChildGauges } from "../utils/gauges"
import { useActiveWeb3React } from "."

export type RegistryAddresses = Partial<Record<string, string>>

export const useRegistryAddress = (): UseQueryResult<RegistryAddresses> => {
  const { chainId } = useActiveWeb3React()
  const masterRegistry = useMasterRegistry()

  return useQuery([QueryKeys.RegistryAddress], async () => {
    if (!masterRegistry) {
      throw new ContractNotLoadedError("Master Registry")
    }

    const addresses: RegistryAddresses = {}

    if (chainId && shouldLoadChildGauges(chainId)) {
      const childGaugeFactoryAddress =
        await masterRegistry.resolveNameToLatestAddress(
          formatBytes32String(CHILD_GAUGE_FACTORY_NAME),
        )
      addresses[CHILD_GAUGE_FACTORY_NAME] = childGaugeFactoryAddress
    }

    return addresses
  })
}
