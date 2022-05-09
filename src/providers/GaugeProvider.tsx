import {
  ChainId,
  GAUGE_CONTROLLER_ADDRESSES,
  HELPER_CONTRACT_ADDRESSES,
} from "../constants"
import React, { ReactElement, useEffect, useState } from "react"
import {
  createMultiCallContract,
  enumerate,
  getMulticallProvider,
} from "../utils"
import {
  useGaugeControllerContract,
  useHelperContract,
} from "../hooks/useContract"
import { BigNumber } from "ethers"
import GAUGE_CONTROLLER_ABI from "../constants/abis/gaugeController.json"
import { GaugeController } from "../../types/ethers-contracts/GaugeController"
import HELPER_CONTRACT_ABI from "../constants/abis/helperContract.json"
import { HelperContract } from "../../types/ethers-contracts/HelperContract"
import { Web3Provider } from "@ethersproject/providers"
import { useActiveWeb3React } from "../hooks"

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
  const { chainId, library } = useActiveWeb3React()
  const gaugeController = useGaugeControllerContract()
  const helperContract = useHelperContract()
  const [gauges, setGauges] = useState<Gauges>(initialGaugesState)

  useEffect(() => {
    async function fetchGauges() {
      if (!gaugeController || !helperContract || !chainId || !library) return
      const nGauges = await gaugeController.n_gauges()
      const gaugeData: { [poolAddress: string]: Gauge } = await getGaugeData(
        library,
        chainId,
        nGauges.toNumber(),
      )

      setGauges({
        gaugeCount: nGauges.toNumber(),
        gauges: gaugeData,
      })
    }

    void fetchGauges()
  }, [chainId, library, gaugeController, helperContract])

  console.log("gauges", gauges)

  return (
    <GaugeContext.Provider value={gauges}>{children}</GaugeContext.Provider>
  )
}

export async function getGaugeData(
  library: Web3Provider,
  chainId: ChainId,
  gaugeCount: number,
): Promise<{
  [poolAddress: string]: Gauge
}> {
  if (chainId !== ChainId.HARDHAT) return {}
  const ethCallProvider = await getMulticallProvider(library, chainId)
  const helperContractAddress = HELPER_CONTRACT_ADDRESSES[chainId]
  const gaugeControllerContractAddress = GAUGE_CONTROLLER_ADDRESSES[chainId]

  const helperContractMultiCall = createMultiCallContract<HelperContract>(
    helperContractAddress,
    HELPER_CONTRACT_ABI,
  )

  const gaugeControllerMultiCall = createMultiCallContract<GaugeController>(
    gaugeControllerContractAddress,
    GAUGE_CONTROLLER_ABI,
  )

  const gaugeAddresses = await ethCallProvider.all(
    enumerate(gaugeCount, 0).map((value) =>
      gaugeControllerMultiCall.gauges(value),
    ),
  )

  const gaugePoolAddresses: string[] = (
    await ethCallProvider.all(
      gaugeAddresses.map((address) =>
        helperContractMultiCall.gaugeToPoolAddress(address),
      ),
    )
  ).map((poolAddress) => poolAddress.toLowerCase())

  const gaugeWeightsPromise: Promise<BigNumber[]> = ethCallProvider.all(
    gaugeAddresses.map((gaugeAddress) =>
      gaugeControllerMultiCall.get_gauge_weight(gaugeAddress),
    ),
  )

  const gaugeRelativeWeightsPromise: Promise<BigNumber[]> = ethCallProvider.all(
    gaugeAddresses.map((gaugeAddress) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      gaugeControllerMultiCall.gauge_relative_weight(gaugeAddress),
    ),
  )

  const [gaugeWeights, gaugeRelativeWeights] = await Promise.all([
    gaugeWeightsPromise,
    gaugeRelativeWeightsPromise,
  ])

  const gaugeData: { [poolAddress: string]: Gauge } = gaugePoolAddresses.reduce(
    (previousGaugeData, gaugePoolAddress, index) => {
      return {
        ...previousGaugeData,
        [gaugePoolAddress]: {
          address: gaugeAddresses[index],
          poolAddress: gaugePoolAddress,
          gaugeWeight: gaugeWeights[index],
          gaugeRelativeWeight: gaugeRelativeWeights[index],
        },
      }
    },
    {},
  )

  return gaugeData
}
