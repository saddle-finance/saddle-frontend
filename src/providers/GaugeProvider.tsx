import { Gauges, getGaugeData, initialGaugesState } from "../utils/gauges"
import React, { ReactElement, useContext, useEffect, useState } from "react"
import { BasicPoolsContext } from "./BasicPoolsProvider"
import { useActiveWeb3React } from "../hooks"
import { useRegistryAddress } from "../hooks/useRegistryAddress"

export const GaugeContext = React.createContext<Gauges>(initialGaugesState)

export default function GaugeProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const { chainId, signerOrProvider } = useActiveWeb3React()
  const basicPools = useContext(BasicPoolsContext)
  const { data: registryAddresses } = useRegistryAddress()
  const [gauges, setGauges] = useState<Gauges>(initialGaugesState)

  useEffect(() => {
    async function fetchGauges() {
      const gaugesData = await getGaugeData(
        signerOrProvider,
        chainId,
        basicPools,
        registryAddresses,
      )

      if (gaugesData) {
        setGauges((prev) => ({
          ...prev,
          gaugeCount: gaugesData.gaugeCount,
          gauges: gaugesData.gauges,
        }))
      }
    }

    void fetchGauges()
  }, [chainId, basicPools, registryAddresses, signerOrProvider])

  return (
    <GaugeContext.Provider value={gauges}>{children}</GaugeContext.Provider>
  )
}
