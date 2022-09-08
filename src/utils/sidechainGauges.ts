import {
  ChainId,
  GAUGE_CONTROLLER_ADDRESSES,
  ROOT_GAUGE_FACTORY_CONTRACT_ADDRESSES,
} from "../constants"
import { createMultiCallContract, enumerate, getMulticallProvider } from "."
import { BigNumber } from "@ethersproject/bignumber"
import GAUGE_CONTROLLER_ABI from "../constants/abis/gaugeController.json"
import { GaugeController } from "../../types/ethers-contracts/GaugeController"
import ROOT_GAUGE_ABI from "../constants/abis/rootGauge.json"
import ROOT_GAUGE_FACTORY_ABI from "../constants/abis/rootGaugeFactory.json"
import { RootGauge } from "../../types/ethers-contracts/RootGauge"
import { RootGaugeFactory } from "../../types/ethers-contracts/RootGaugeFactory"
import { Web3Provider } from "@ethersproject/providers"

export type SidechainGauges = {
  gauges: SideChainGauge[]
}

export type SideChainGauge = {
  address: string
  gaugeRelativeWeight: BigNumber
  gaugeName: string
  isKilled: boolean
}

export async function getSidechainGaugeData(
  library: Web3Provider,
  chainId: ChainId,
  rootGaugeFactory: RootGaugeFactory,
): Promise<SidechainGauges> {
  try {
    const gaugeControllerContractAddress = GAUGE_CONTROLLER_ADDRESSES[chainId]
    const rootGaugeFactoryContractAddress =
      ROOT_GAUGE_FACTORY_CONTRACT_ADDRESSES[chainId]
    const ethCallProvider = await getMulticallProvider(library, chainId)
    const gaugeControllerMultiCall = createMultiCallContract<GaugeController>(
      gaugeControllerContractAddress,
      GAUGE_CONTROLLER_ABI,
    )

    const rootGaugeFactoryMultiCall = createMultiCallContract<RootGaugeFactory>(
      rootGaugeFactoryContractAddress,
      ROOT_GAUGE_FACTORY_ABI,
    )
    const sideChainGaugeCount = (
      await rootGaugeFactory.get_gauge_count(ChainId.TEST_SIDE_CHAIN)
    ).toNumber()

    const gaugeAddresses: string[] = (
      await ethCallProvider.tryAll(
        enumerate(sideChainGaugeCount, 0).map((index) =>
          rootGaugeFactoryMultiCall.get_gauge(ChainId.TEST_SIDE_CHAIN, index),
        ),
      )
    ).filter(Boolean) as string[]

    const sideChainGaugeMulticallContracts = gaugeAddresses.map(
      (gaugeAddress) =>
        createMultiCallContract<RootGauge>(gaugeAddress, ROOT_GAUGE_ABI),
    )
    const gaugeNamesPromise: Promise<(string | null)[]> =
      ethCallProvider.tryAll(
        sideChainGaugeMulticallContracts.map((contract) => contract.name()),
      )
    const gaugeRelativeWeightsPromise: Promise<(BigNumber | null)[]> =
      ethCallProvider.tryAll(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        gaugeAddresses.map((gaugeAddress) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
          gaugeControllerMultiCall.gauge_relative_weight(gaugeAddress),
        ),
      )
    const gaugeKilledStatusesPromise: Promise<(boolean | null)[]> =
      ethCallProvider.tryAll(
        sideChainGaugeMulticallContracts.map((contract) =>
          contract.is_killed(),
        ),
      )

    const [gaugeNames, gaugeRelativeWeights, gaugeKilledStatuses] =
      await Promise.all([
        gaugeNamesPromise,
        gaugeRelativeWeightsPromise,
        gaugeKilledStatusesPromise,
      ])

    const sidechainGauges: SideChainGauge[] = enumerate(
      gaugeAddresses.length,
      0,
    )
      .map((index) => {
        if (
          gaugeNames[index] == null ||
          gaugeRelativeWeights[index] == null ||
          gaugeKilledStatuses[index] == null
        )
          return
        return {
          address: gaugeAddresses[index],
          gaugeName: gaugeNames[index],
          gaugeRelativeWeight: gaugeRelativeWeights[index],
          isKilled: gaugeKilledStatuses[index],
        }
      })
      .filter(Boolean) as SideChainGauge[]

    return {
      gauges: sidechainGauges,
    }
  } catch (e) {
    const error = e as Error
    error.message = `Failed to get sidechain gauge data; ${error.message}`
    console.error(error)
    return {
      gauges: [],
    }
  }
}
