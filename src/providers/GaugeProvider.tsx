import { Gauges, getGaugeData, initialGaugesState } from "../utils/gauges"
import React, { ReactElement, useContext, useEffect, useState } from "react"
import {
  useChildGaugeFactory,
  useGaugeControllerContract,
  useGaugeMinterContract,
} from "../hooks/useContract"

import { BasicPoolsContext } from "./BasicPoolsProvider"
import { useActiveWeb3React } from "../hooks"

export const GaugeContext = React.createContext<Gauges>(initialGaugesState)

export default function GaugeProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const { chainId, library, account } = useActiveWeb3React()
  const gaugeControllerContract = useGaugeControllerContract()
  const childGaugeFactory = useChildGaugeFactory()
  const basicPools = useContext(BasicPoolsContext)
  const gaugeMinterContract = useGaugeMinterContract() // only exists on mainnet
  const [gauges, setGauges] = useState<Gauges>(initialGaugesState)

  useEffect(() => {
    async function fetchGauges() {
      console.log({
        childGaugeFactory,
        chainId,
        library,
        gaugeControllerContract,
      })

      if (!childGaugeFactory || !chainId || !library) return
      const gauges: Gauges =
        (await getGaugeData(
          library,
          chainId,
          basicPools,
          gaugeControllerContract,
          childGaugeFactory,
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
    childGaugeFactory,
    gaugeMinterContract,
  ])

  return (
    <GaugeContext.Provider value={gauges}>{children}</GaugeContext.Provider>
  )
}
