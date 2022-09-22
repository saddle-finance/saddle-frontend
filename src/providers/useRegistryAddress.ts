import {
  CHILD_GAUGE_FACTORY_NAME,
  useMasterRegistry,
} from "../hooks/useContract"
import { UseQueryResult, useQuery } from "@tanstack/react-query"
import { ChainId } from "../constants"
import { parseBytes32String } from "ethers/lib/utils"
import { useActiveWeb3React } from "../hooks"

export type RegistryAddress = Partial<Record<string, string>>

export const useRegistryAddress = (): UseQueryResult<RegistryAddress> => {
  const { chainId } = useActiveWeb3React()
  const masterRegistry = useMasterRegistry()

  return useQuery(["registryAddress"], async () => {
    if (!masterRegistry) {
      console.error(
        "Master Registry not available. Unable to retrieve contract addresses",
      )
      return {}
    }

    if (chainId !== ChainId.MAINNET && chainId !== ChainId.HARDHAT) {
      const childGaugeFactoryAddress =
        await masterRegistry.resolveNameToLatestAddress(
          CHILD_GAUGE_FACTORY_NAME,
        )
      const addresses: Partial<Record<string, string>> = {}
      addresses[parseBytes32String(CHILD_GAUGE_FACTORY_NAME)] =
        childGaugeFactoryAddress

      return addresses
    }

    return {}
  })
}
