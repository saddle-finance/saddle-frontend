import { Gauges, getGaugeData, initialGaugesState } from "../utils/gauges"
import React, { ReactElement, useContext, useEffect, useState } from "react"
import { BasicPoolsContext } from "./BasicPoolsProvider"
import { useActiveWeb3React } from "../hooks"
import { useGaugeMinterContract } from "../hooks/useContract"
import { useRegistryAddress } from "../hooks/useRegistryAddress"

export const GaugeContext = React.createContext<Gauges>(initialGaugesState)

export default function GaugeProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const { chainId, library, account } = useActiveWeb3React()
  const basicPools = useContext(BasicPoolsContext)
  const gaugeMinterContract = useGaugeMinterContract() // only exists on mainnet
  const { data: registryAddresses } = useRegistryAddress()
  const [gauges, setGauges] = useState<Gauges>(initialGaugesState)

  useEffect(() => {
    async function fetchGauges() {
      if (!chainId || !library || !registryAddresses) return
      const gauges: Gauges = await getGaugeData(
        library,
        chainId,
        basicPools,
        registryAddresses,
        account ?? undefined,
      )

      setGauges(gauges)
    }

    void fetchGauges()
  }, [
    chainId,
    library,
    gaugeMinterContract,
    account,
    basicPools,
    registryAddresses,
  ])

  return (
    <GaugeContext.Provider value={gauges}>{children}</GaugeContext.Provider>
  )
}
