import React, { ReactElement, useEffect, useState } from "react"
import { useGaugeController, useHelperContract } from "../hooks/useContract"
import { BigNumber } from "ethers"
import { PoolTypes } from "../constants"

type GaugePoolData = {
  poolAddress: string
  lpToken: string
  typeOfAsset: PoolTypes
  poolName: string
  targetAddress: string | null
  tokens: string[]
  underlyingTokens: string[]
  basePoolAddress: string
  metaSwapDepositAddress: string
  isSaddleApproved: boolean
  isRemoved: boolean
  isGuarded: boolean
}

export type Gauge = {
  address: string
  lpToken: string
  name: string
  symbol?: string
  gaugeWeight: BigNumber
  gaugeRelativeWeight: BigNumber
  workingSupply?: BigNumber
}

export type Gauges = {
  gaugeCount: number
  gauges: Gauge[]
} | null

export const GaugeContext = React.createContext<Gauges>(null)

export default function GaugeProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const gaugeController = useGaugeController()
  const helperContract = useHelperContract()
  const [gauges, setGauges] = useState<Gauges>(null)

  useEffect(() => {
    async function fetchGauges() {
      const gaugeData: Gauge[] = []
      if (!gaugeController || !helperContract) return
      const nGauges = await gaugeController.n_gauges()
      for (let i = 0; i < nGauges.toNumber(); i++) {
        const gaugeAddress = await gaugeController.gauges(i)
        const gaugePoolData: GaugePoolData =
          await helperContract.gaugeToPoolData(gaugeAddress)
        const gaugeWeight = await gaugeController.get_gauge_weight(
          gaugePoolData.poolAddress,
        )
        const gaugeRelativeWeight = await gaugeController[
          "gauge_relative_weight(address)"
        ](gaugePoolData.poolAddress)
        gaugeData.push({
          address: gaugePoolData.poolAddress,
          lpToken: gaugePoolData.lpToken,
          name: gaugePoolData.poolName,
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
  }, [gaugeController, helperContract])

  return (
    <GaugeContext.Provider value={gauges}>{children}</GaugeContext.Provider>
  )
}
