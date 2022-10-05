import { Gauges, getGaugeData, initialGaugesState } from "../utils/gauges"
import React, { ReactElement, useContext } from "react"
import {
  useGaugeControllerContract,
  useGaugeMinterContract,
} from "../hooks/useContract"

import { BasicPoolsContext } from "./BasicPoolsProvider"
import { useActiveWeb3React } from "../hooks"
import { useQuery } from "@tanstack/react-query"

export const GaugeContext = React.createContext<Gauges>(initialGaugesState)

export default function GaugeProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const { chainId, library, account } = useActiveWeb3React()
  const gaugeControllerContract = useGaugeControllerContract()
  const basicPools = useContext(BasicPoolsContext)
  const gaugeMinterContract = useGaugeMinterContract() // only exists on mainnet
  const { data: gauges } = useQuery(["gauges", chainId, account], fetchGauges)

  async function fetchGauges() {
    if (
      !gaugeControllerContract ||
      !chainId ||
      !library ||
      !gaugeMinterContract
    )
      return
    return getGaugeData(
      library,
      chainId,
      gaugeControllerContract,
      basicPools,
      gaugeMinterContract,
      account ?? undefined,
    )
  }

  return (
    <GaugeContext.Provider value={gauges ?? initialGaugesState}>
      {children}
    </GaugeContext.Provider>
  )
}
