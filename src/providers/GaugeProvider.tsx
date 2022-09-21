import { Gauges, getGaugeData, initialGaugesState } from "../utils/gauges"
import React, { ReactElement, useContext, useEffect, useState } from "react"
import {
  useChildGaugeFactory,
  useGaugeControllerContract,
  useGaugeMinterContract,
  useMasterRegistry,
} from "../hooks/useContract"

import { BasicPoolsContext } from "./BasicPoolsProvider"
import { useActiveWeb3React } from "../hooks"

export const GaugeContext = React.createContext<Gauges>(initialGaugesState)

export default function GaugeProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const { chainId, library, account } = useActiveWeb3React()
  const gaugeControllerContract = useGaugeControllerContract()
  const gaugeMinterContract = useGaugeMinterContract() // only exists on mainnet
  const masterRegistry = useMasterRegistry()
  const basicPools = useContext(BasicPoolsContext)
  const childGaugeFactory = useChildGaugeFactory() // Only exists on sidechain
  const [gauges, setGauges] = useState<Gauges>(initialGaugesState)

  useEffect(() => {
    async function fetchGauges() {
      if (!chainId || !library || !masterRegistry) return
      const gauges: Gauges =
        (await getGaugeData(
          library,
          chainId,
          basicPools,
          masterRegistry,
          childGaugeFactory,
          gaugeControllerContract,
          gaugeMinterContract,
          account ?? undefined,
        )) || initialGaugesState
      setGauges(gauges)
    }

    void fetchGauges()
  }, [
    chainId,
    library,
    gaugeControllerContract,
    account,
    basicPools,
    gaugeMinterContract,
    masterRegistry,
    childGaugeFactory,
  ])

  return (
    <GaugeContext.Provider value={gauges}>{children}</GaugeContext.Provider>
  )
}
