import {
  ChainId,
  GAUGE_CONTROLLER_ADDRESSES,
  HELPER_CONTRACT_ADDRESSES,
} from "../constants"
import React, { ReactElement, useEffect, useState } from "react"
import {
  createMultiCallContract,
  useGaugeControllerContract,
  useHelperContract,
} from "../hooks/useContract"
import { BigNumber } from "ethers"
import GAUGE_CONTROLLER_ABI from "../constants/abis/gaugeController.json"
import { GaugeController } from "../../types/ethers-contracts/GaugeController"
import HELPER_CONTRACT_ABI from "../constants/abis/helperContract.json"
import { HelperContract } from "../../types/ethers-contracts/HelperContract"
import { MulticallContract } from "../types/ethcall"
import { Web3Provider } from "@ethersproject/providers"
import { getMulticallProvider } from "../utils"
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
      // const gaugeData: { [poolAddress: string]: Gauge } = {}
      if (!gaugeController || !helperContract || !chainId || !library) return
      const nGauges = await gaugeController.n_gauges()
      // for (let i = 1; i <= nGauges.toNumber(); i++) {
      //   const gaugeAddress: string = await gaugeController.gauges(i)
      //   const gaugePoolAddress: string = (
      //     await helperContract.gaugeToPoolAddress(gaugeAddress)
      //   ).toLowerCase()
      //   const gaugeWeight = await gaugeController.get_gauge_weight(gaugeAddress)
      //   const gaugeRelativeWeight = await gaugeController[
      //     "gauge_relative_weight(address)"
      //   ](gaugeAddress)
      //   gaugeData[gaugePoolAddress] = {
      //     address: gaugeAddress,
      //     poolAddress: gaugePoolAddress,
      //     gaugeWeight,
      //     gaugeRelativeWeight,
      //   }
      // }

      const gaugeData: { [poolAddress: string]: Gauge } = await getGaugeData(
        nGauges,
        library,
        chainId,
      )

      console.log("gaugeData", gaugeData)

      setGauges({
        gaugeCount: nGauges.toNumber(),
        gauges: gaugeData,
      })
    }

    void fetchGauges()
  }, [chainId, library, gaugeController, helperContract])

  return (
    <GaugeContext.Provider value={gauges}>{children}</GaugeContext.Provider>
  )
}

export async function getGaugeData(
  nGauges: BigNumber,
  library: Web3Provider,
  chainId: ChainId,
): Promise<{
  [poolAddress: string]: Gauge
}> {
  const ethCallProvider = await getMulticallProvider(library, chainId)
  const helperContractAddress = HELPER_CONTRACT_ADDRESSES[chainId]
  const gaugeControllerContractAddress = GAUGE_CONTROLLER_ADDRESSES[chainId]

  const helperContractMultiCall: MulticallContract<HelperContract> =
    createMultiCallContract(helperContractAddress, HELPER_CONTRACT_ABI)

  const gaugeControllerMultiCall: MulticallContract<GaugeController> =
    createMultiCallContract(
      gaugeControllerContractAddress,
      GAUGE_CONTROLLER_ABI,
    )
  const gaugeAddresses = await ethCallProvider.all(
    [...Array(nGauges)].map((value) =>
      gaugeControllerMultiCall.gauges(value.toNumber() + 1),
    ),
  )
  const gaugePoolAddresses: string[] = (
    await ethCallProvider.all(
      gaugeAddresses.map((address) =>
        helperContractMultiCall.gaugeToPoolAddress(address),
      ),
    )
  ).map((poolAddress) => poolAddress.toLowerCase())

  const gaugeWeights: BigNumber[] = await ethCallProvider.all(
    gaugePoolAddresses.map((poolAddress) =>
      gaugeControllerMultiCall.get_gauge_weight(poolAddress),
    ),
  )

  const gaugeRelativeWeights: BigNumber[] = await ethCallProvider.all(
    gaugePoolAddresses.map((poolAddress) =>
      gaugeControllerMultiCall["gauge_relative_weight(address)"](poolAddress),
    ),
  )

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
