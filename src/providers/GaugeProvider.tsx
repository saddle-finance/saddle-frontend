import { Gauges, getGaugeData, initialGaugesState } from "../utils/gauges"
import React, { ReactElement, useEffect, useState } from "react"

import { useActiveWeb3React } from "../hooks"
import { useGaugeControllerContract } from "../hooks/useContract"

export const GaugeContext = React.createContext<Gauges>(initialGaugesState)

export default function GaugeProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const { chainId, library } = useActiveWeb3React()
  const gaugeController = useGaugeControllerContract()
  const [gauges, setGauges] = useState<Gauges>(initialGaugesState)

  useEffect(() => {
    async function fetchGauges() {
      if (!gaugeController || !chainId || !library) return
      const gauges: Gauges =
        (await getGaugeData(library, chainId, gaugeController)) ||
        initialGaugesState
      setGauges(gauges)
    }

    void fetchGauges()
  }, [chainId, library, gaugeController])

  return (
    <GaugeContext.Provider value={gauges}>{children}</GaugeContext.Provider>
  )
}
