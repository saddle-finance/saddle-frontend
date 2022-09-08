import React, { ReactElement, useEffect, useState } from "react"
import {
  SidechainGauges,
  getSidechainGaugeData,
} from "../utils/sidechainGauges"
import {
  useGaugeControllerContract,
  useRootGaugeFactory,
} from "../hooks/useContract"
import { useActiveWeb3React } from "../hooks"

export const SidechainGaugeContext = React.createContext<SidechainGauges>({
  gauges: [],
})

export default function SidechainGaugeProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const { chainId, library, account } = useActiveWeb3React()
  const rootGaugeFactory = useRootGaugeFactory()
  const [sidechainGauges, setSidechainGauges] = useState<SidechainGauges>({
    gauges: [],
  })

  const gaugeController = useGaugeControllerContract()

  useEffect(() => {
    async function fetchSidechainGauges() {
      if (!rootGaugeFactory || !gaugeController || !chainId || !library) return
      const sidechainGauges: SidechainGauges = await getSidechainGaugeData(
        library,
        chainId,
        rootGaugeFactory,
      )

      setSidechainGauges(sidechainGauges)
    }

    void fetchSidechainGauges()
  }, [chainId, library, account, rootGaugeFactory, gaugeController])

  return (
    <SidechainGaugeContext.Provider value={sidechainGauges}>
      {children}
    </SidechainGaugeContext.Provider>
  )
}
