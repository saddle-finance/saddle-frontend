import {
  GAUGE_CONTROLLER_ADDRESSES,
  IS_CROSS_CHAIN_GAUGES_LIVE,
  ROOT_GAUGE_FACTORY_CONTRACT_ADDRESSES,
} from "../constants"
import { UseQueryResult, useQuery } from "@tanstack/react-query"
import {
  createMultiCallContract,
  enumerate,
  getMulticallProvider,
} from "../utils"

import { BigNumber } from "ethers"
import { ChainId } from "../constants/networks"
import GAUGE_CONTROLLER_ABI from "../constants/abis/gaugeController.json"
import { GaugeController } from "../../types/ethers-contracts/GaugeController"
import { QueryKeys } from "./queryKeys"
import ROOT_GAUGE_ABI from "../constants/abis/rootGauge.json"
import ROOT_GAUGE_FACTORY_ABI from "../constants/abis/rootGaugeFactory.json"
import { RootGauge } from "../../types/ethers-contracts/RootGauge"
import { RootGaugeFactory } from "../../types/ethers-contracts/RootGaugeFactory"
import { useActiveWeb3React } from "."

type SidechainGauges = {
  gauges: SidechainGauge[]
}

type SidechainGauge = {
  chainId: ChainId
  gaugeName: string
  displayName: string
  address: string
  isKilled: boolean
  gaugeRelativeWeight: BigNumber
}

const defaultSidechainGauges = {
  gauges: [],
}

export const useSidechainGaugeWeightDataOnMainnet =
  (): UseQueryResult<SidechainGauges> => {
    const { library, chainId } = useActiveWeb3React()
    if (!library || !chainId)
      throw new Error("Unable to retrieve Sidechain gauge weight data")

    const chainIds = [ChainId.ARBITRUM, ChainId.OPTIMISM]

    return useQuery([QueryKeys.SidechainGaugeWeightData], async () => {
      if (!IS_CROSS_CHAIN_GAUGES_LIVE) {
        return defaultSidechainGauges
      }
      const ethCallProvider = await getMulticallProvider(library, chainId)
      const gaugeControllerMultiCall = createMultiCallContract<GaugeController>(
        GAUGE_CONTROLLER_ADDRESSES[chainId],
        GAUGE_CONTROLLER_ABI,
      )

      const rootGaugeFactoryMultiCall =
        createMultiCallContract<RootGaugeFactory>(
          ROOT_GAUGE_FACTORY_CONTRACT_ADDRESSES[chainId],
          ROOT_GAUGE_FACTORY_ABI,
        )
      const sidechainGaugeCounts = await ethCallProvider.tryAll(
        chainIds.map((id) => rootGaugeFactoryMultiCall.get_gauge_count(id)),
      )

      const sidechainGaugeAddresses: string[][] = (
        await Promise.all(
          sidechainGaugeCounts.map((count, chainIndex) => {
            if (!count) {
              return Promise.resolve([])
            }

            return ethCallProvider.tryAll(
              enumerate(count.toNumber(), 0).map((index) => {
                return rootGaugeFactoryMultiCall.get_gauge(
                  BigNumber.from(chainIds[chainIndex]),
                  index,
                )
              }),
            )
          }),
        )
      )
        .map((addresses) => addresses.filter(Boolean) as string[])
        .map((addresses) => addresses.map((addr) => addr.toLowerCase()))

      const sidechainGaugesMultiCallContracts = sidechainGaugeAddresses.map(
        (gaugeAddresses) =>
          gaugeAddresses.map((gaugeAddress) =>
            createMultiCallContract<RootGauge>(gaugeAddress, ROOT_GAUGE_ABI),
          ),
      )

      const sidechainGaugesNamesPromises = Promise.all(
        sidechainGaugesMultiCallContracts.map((gaugeContracts) =>
          ethCallProvider.tryAll(
            gaugeContracts.map((contract) => contract.name()),
          ),
        ),
      )

      const sidechainGaugesKilledStatusesPromises = Promise.all(
        sidechainGaugesMultiCallContracts.map((gaugeContracts) =>
          ethCallProvider.tryAll(
            gaugeContracts.map((contract) => contract.is_killed()),
          ),
        ),
      )

      const sidechainGaugeRelativeWeightsPromises = Promise.all(
        sidechainGaugeAddresses.map((gaugeAddresses) =>
          ethCallProvider.tryAll(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            gaugeAddresses.map((gaugeAddress) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
              return gaugeControllerMultiCall.gauge_relative_weight_write(
                gaugeAddress,
              )
            }),
          ),
        ),
      )

      const [
        sidechainGaugesNames,
        sidechainGaugesRelativeWeights,
        sidechainGaugesKilledStatuses,
      ] = await Promise.all([
        sidechainGaugesNamesPromises,
        sidechainGaugeRelativeWeightsPromises,
        sidechainGaugesKilledStatusesPromises,
      ])

      const sidechainGauges = sidechainGaugeAddresses
        .map(
          (gaugeAddresses, chainIdIndex) =>
            enumerate(gaugeAddresses.length, 0)
              .map((index) => {
                if (
                  sidechainGaugesNames[chainIdIndex][index] == null ||
                  sidechainGaugesRelativeWeights[chainIdIndex][index] == null ||
                  sidechainGaugesKilledStatuses[chainIdIndex][index] == null
                )
                  return
                const gaugeName =
                  sidechainGaugesNames[chainIdIndex][index] || ""
                const chainId = chainIds[chainIdIndex]
                return {
                  chainId,
                  gaugeName,
                  address: gaugeAddresses[index],
                  gaugeRelativeWeight:
                    sidechainGaugesRelativeWeights[chainIdIndex][index],
                  isKilled: sidechainGaugesKilledStatuses[chainIdIndex][index],
                  displayName: `${ChainId[chainId]}_${gaugeName
                    .replace("Saddle ", "")
                    .replace(" Root Gauge", "-gauge")}`,
                }
              })
              .filter(Boolean) as SidechainGauge[],
        )
        .flat()

      return {
        gauges: sidechainGauges,
      }
    })
  }
