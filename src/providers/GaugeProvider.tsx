import { BasicPool, BasicPoolsContext } from "./BasicPoolsProvider"
import React, { ReactElement, useContext, useEffect, useState } from "react"
import { useGaugeController, useHelperContract } from "../hooks/useContract"
import { BigNumber } from "ethers"

export type Gauge = {
  address: string
  lpToken: string
  name: string
  symbol?: string
  gaugeWeight: BigNumber
  poolAddress: string
  gaugeRelativeWeight: BigNumber
  workingSupply?: BigNumber
}

export type Gauges = {
  gaugeCount: number
  gauges: Gauge[]
}

const initialGaugesState: Gauges = {
  gaugeCount: 0,
  gauges: [],
}

export const GaugeContext = React.createContext<Gauges>(initialGaugesState)

export default function GaugeProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const gaugeController = useGaugeController()
  const helperContract = useHelperContract()
  const poolsContext = useContext(BasicPoolsContext)
  const [gauges, setGauges] = useState<Gauges>(initialGaugesState)

  useEffect(() => {
    async function fetchGauges() {
      //convert Basic Pools object to key on pool address
      //instead of poolName for O(1) lookup
      const pools: { [poolAddress: string]: BasicPool } = {}
      Object.values(poolsContext || []).forEach((pool) => {
        if (pool) {
          pools[pool.poolAddress] = { ...pool }
        }
      })
      // initialize the gauge data
      const gaugeData: Gauge[] = []
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
        gaugeData.push({
          address: gaugeAddress,
          lpToken: pools[gaugePoolAddress]?.lpToken,
          name: pools[gaugePoolAddress]?.poolName,
          poolAddress: gaugePoolAddress,
          gaugeWeight,
          gaugeRelativeWeight,
        })
      }
      setGauges({
        gaugeCount: nGauges.toNumber(),
        gauges: gaugeData,
      })
    }

    void fetchGauges()
  }, [poolsContext, gaugeController, helperContract])

  return (
    <GaugeContext.Provider value={gauges}>{children}</GaugeContext.Provider>
  )
}
