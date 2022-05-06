import React, { ReactElement, useEffect, useState } from "react"
import {
  useGaugeControllerContract,
  useHelperContract,
} from "../hooks/useContract"
import { BigNumber } from "ethers"

export type Gauge = {
  address: string
  gaugeWeight: BigNumber
  poolAddress: string
  gaugeRelativeWeight: BigNumber
  workingSupply?: BigNumber
}

export type Gauges = {
  gaugeCount: number
  gauges: { [poolAddress: string]: Gauge }
}

const initialGaugesState: Gauges = {
  gaugeCount: 0,
  gauges: {},
}

export const GaugeContext = React.createContext<Gauges>(initialGaugesState)

export default function GaugeProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const gaugeController = useGaugeControllerContract()
  const helperContract = useHelperContract()
  const [gauges, setGauges] = useState<Gauges>(initialGaugesState)

  useEffect(() => {
    async function fetchGauges() {
      const gaugeData: { [poolAddress: string]: Gauge } = {}
      if (!gaugeController || !helperContract) return
      const nGauges = await gaugeController.n_gauges()
      for (let i = 0; i < nGauges.toNumber(); i++) {
        const gaugeAddress: string = await gaugeController.gauges(i)
        const gaugePoolAddress: string = (
          await helperContract.gaugeToPoolAddress(gaugeAddress)
        ).toLowerCase()
        const gaugeWeight = await gaugeController.get_gauge_weight(gaugeAddress)
        const gaugeRelativeWeight = await gaugeController[
          "gauge_relative_weight(address)"
        ](gaugeAddress)
        gaugeData[gaugePoolAddress] = {
          address: gaugeAddress,
          poolAddress: gaugePoolAddress,
          gaugeWeight,
          gaugeRelativeWeight,
        }
      }

      setGauges({
        gaugeCount: nGauges.toNumber(),
        gauges: gaugeData,
      })
    }

    void fetchGauges()
  }, [gaugeController, helperContract])

  return (
    <GaugeContext.Provider value={gauges}>{children}</GaugeContext.Provider>
  )
}
