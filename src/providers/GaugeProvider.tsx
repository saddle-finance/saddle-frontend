import { Gauges, getGaugeData, initialGaugesState } from "../utils/gauges"
import React, { ReactElement, useContext, useEffect, useState } from "react"
import {
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
  const basicPools = useContext(BasicPoolsContext)
  const gaugeMinterContract = useGaugeMinterContract() // only exists on mainnet
  const [gauges, setGauges] = useState<Gauges>(initialGaugesState)

  useEffect(() => {
    async function fetchGauges() {
      if (
        !gaugeControllerContract ||
        !chainId ||
        !library ||
        !gaugeMinterContract ||
        !account
      )
        return
      const gauges: Gauges =
        (await getGaugeData(
          library,
          chainId,
          gaugeControllerContract,
          basicPools,
          account,
          gaugeMinterContract,
        )) || initialGaugesState
      setGauges(gauges)
    }

    void fetchGauges()
  }, [
    chainId,
    library,
    gaugeControllerContract,
    gaugeMinterContract,
    account,
    basicPools,
  ])

  return (
    <GaugeContext.Provider value={gauges}>{children}</GaugeContext.Provider>
  )
}
