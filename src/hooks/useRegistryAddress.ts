import { CHILD_GAUGE_FACTORY_NAME, useMasterRegistry } from "./useContract"
import { QueryKeys } from "./queryKeys"
import { formatBytes32String } from "ethers/lib/utils"
import { shouldLoadChildGauges } from "../utils/gauges"
import { useActiveWeb3React } from "."
import { useQuery } from "@tanstack/react-query"

export type RegistryAddresses = Partial<Record<string, string>>

export const useRegistryAddress = () => {
  const { chainId } = useActiveWeb3React()
  const masterRegistry = useMasterRegistry()

  console.log(
    "master registry enabled ==>",
    !!masterRegistry,
    shouldLoadChildGauges(chainId),
    !!masterRegistry && shouldLoadChildGauges(chainId),
  )

  return useQuery([QueryKeys.RegistryAddress], {
    queryFn: async () => {
      const childGaugeFactoryAddress =
        await masterRegistry?.resolveNameToLatestAddress(
          formatBytes32String(CHILD_GAUGE_FACTORY_NAME),
        )

      return { [CHILD_GAUGE_FACTORY_NAME]: childGaugeFactoryAddress }
    },
    enabled: !!masterRegistry && shouldLoadChildGauges(chainId),
    onError: (err) => {
      console.log("error ==>", err)
    },
  })
}
