import {
  Gauges,
  getGaugeData,
  initialGaugesState,
  shouldLoadChildGauges,
} from "../utils/gauges"
import React, { ReactElement, useContext } from "react"
import { BasicPoolsContext } from "./BasicPoolsProvider"
import { useActiveWeb3React } from "../hooks"
import { useQuery } from "@tanstack/react-query"
import { useRegistryAddress } from "../hooks/useRegistryAddress"

export const GaugeContext = React.createContext<Gauges>(initialGaugesState)

export default function GaugeProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const { chainId, library, account } = useActiveWeb3React()
  const basicPools = useContext(BasicPoolsContext)
  const { data: registryAddresses, isSuccess: isRegistryAddressesSuccess } =
    useRegistryAddress()

  console.log("registry addres ==>", registryAddresses, basicPools)

  const { data: gauges, isLoading } = useQuery(
    ["gauges", registryAddresses, account, chainId],
    {
      queryFn: async () =>
        getGaugeData(
          library,
          chainId,
          basicPools,
          shouldLoadChildGauges(chainId) ? registryAddresses : undefined,
          account ?? undefined,
        ),
      enabled: shouldLoadChildGauges(chainId)
        ? isRegistryAddressesSuccess
        : true,
      onError: (error) => console.log(error),
    },
  )

  return (
    <GaugeContext.Provider value={gauges ?? initialGaugesState}>
      {isLoading ? <div>Loading...</div> : children}
    </GaugeContext.Provider>
  )
}
