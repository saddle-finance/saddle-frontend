import {
  LPTokenAddressToGauge,
  getGaugeData,
  initialGaugesState,
} from "../utils/gauges"
import React, { ReactElement, useContext, useEffect, useState } from "react"
import {
  useGaugeControllerContract,
  useGaugeMinterContract,
} from "../hooks/useContract"

import { BasicPoolsContext } from "./BasicPoolsProvider"
import { useActiveWeb3React } from "../hooks"

export const GaugeContext = React.createContext<{
  gauges: LPTokenAddressToGauge
  gaugeCount: number
  isGaugeLoading?: boolean
}>({ gauges: {}, gaugeCount: 0, isGaugeLoading: true })

export default function GaugeProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const { chainId, library, account } = useActiveWeb3React()
  const gaugeControllerContract = useGaugeControllerContract()
  const basicPools = useContext(BasicPoolsContext)
  const gaugeMinterContract = useGaugeMinterContract() // only exists on mainnet
  const [gauges, setGauges] = useState<LPTokenAddressToGauge>({})
  const [gaugeCount, setGaugeCount] = useState(0)
  const [isGaugeLoading, setIsGaugeLoading] = useState(true)

  useEffect(() => {
    async function fetchGauges() {
      if (
        !gaugeControllerContract ||
        !chainId ||
        !library ||
        !gaugeMinterContract
      )
        return
      const { gauges, gaugeCount } =
        (await getGaugeData(
          library,
          chainId,
          gaugeControllerContract,
          basicPools,
          gaugeMinterContract,
          account ?? undefined,
        )) || initialGaugesState
      setGauges(gauges)
      setGaugeCount(gaugeCount)
    }

    void fetchGauges()
    setIsGaugeLoading(false)
  }, [
    chainId,
    library,
    gaugeControllerContract,
    gaugeMinterContract,
    account,
    basicPools,
  ])

  return (
    <GaugeContext.Provider value={{ gauges, gaugeCount, isGaugeLoading }}>
      {children}
    </GaugeContext.Provider>
  )
}
