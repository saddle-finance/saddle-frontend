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
  isLoading?: boolean
}>({ gauges: {}, gaugeCount: 0, isLoading: true })

export default function GaugeProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const { chainId, library, account } = useActiveWeb3React()
  const gaugeControllerContract = useGaugeControllerContract()
  const basicPools = useContext(BasicPoolsContext)
  const gaugeMinterContract = useGaugeMinterContract() // only exists on mainnet
  const [gauges, setGauges] = useState<LPTokenAddressToGauge>({})
  const [gaugeCount, setGaugeCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

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
    setIsLoading(false)
  }, [
    chainId,
    library,
    gaugeControllerContract,
    gaugeMinterContract,
    account,
    basicPools,
  ])

  return (
    <GaugeContext.Provider value={{ gauges, gaugeCount, isLoading }}>
      {children}
    </GaugeContext.Provider>
  )
}
