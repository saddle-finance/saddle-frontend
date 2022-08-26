import {
  ChainId,
  GENERALIZED_SWAP_MIGRATOR_CONTRACT_ADDRESSES,
} from "../constants"
import { getMulticallProvider, isAddressZero } from "."
import { useContractReads, useNetwork } from "wagmi"

import { Contract } from "ethcall"
import GENERALIZED_SWAP_MIGRATOR_CONTRACT_ABI from "../constants/abis/generalizedSwapMigrator.json"
import { GeneralizedSwapMigrator } from "../../types/ethers-contracts/GeneralizedSwapMigrator"
import { MulticallContract } from "../types/ethcall"
import { Web3Provider } from "@ethersproject/providers"

export type MigrationData = { [poolAddress: string]: string } // current poolAddress => new poolAddress

/**
 * Returns old -> new pool address mappings from GeneralizedMigrator for the given pool addresses.
 */
export async function getMigrationDataOld( // TODO: delete once safe to remove basicPoolsContext
  library: Web3Provider,
  chainId: ChainId,
  poolAddresses: string[],
): Promise<MigrationData | null> {
  const ethCallProvider = await getMulticallProvider(library, chainId)
  const migratorAddress = GENERALIZED_SWAP_MIGRATOR_CONTRACT_ADDRESSES[chainId]
  if (!ethCallProvider || !chainId || !migratorAddress) {
    return null
  }
  try {
    const migratorContract = new Contract(
      migratorAddress,
      GENERALIZED_SWAP_MIGRATOR_CONTRACT_ABI,
    ) as MulticallContract<GeneralizedSwapMigrator>

    const calls = poolAddresses.map((address) =>
      migratorContract.migrationMap(address),
    )
    const results = await ethCallProvider.tryAll(calls)
    const parsedData = poolAddresses.reduce((acc, address, i) => {
      const migrationTarget = results[i]?.newPoolAddress?.toLowerCase()
      if (migrationTarget && !isAddressZero(migrationTarget)) {
        return { [address]: migrationTarget, ...acc }
      }
      return acc
    }, {} as MigrationData)
    return parsedData
  } catch (e) {
    const error = e as Error
    error.message = `Failed to get migration data; ${error.message}`
    console.error(error)
    return null
  }
}

export const useMigrationData = (pools: { poolAddress: string }[]) => {
  const { chain } = useNetwork()
  const migratorAddress =
    GENERALIZED_SWAP_MIGRATOR_CONTRACT_ADDRESSES[chain?.id as ChainId]
  const poolsAddresses = pools?.map(({ poolAddress }) => poolAddress) ?? []
  const migrationMapCalls = poolsAddresses.map((address) => ({
    addressOrName: migratorAddress,
    contractInterface: GENERALIZED_SWAP_MIGRATOR_CONTRACT_ABI,
    functionName: "migrationMap",
    args: address,
  }))
  const { data: migrationMapData } = useContractReads({
    contracts: migrationMapCalls,
    enabled: !!pools,
  })
  const migrations = migrationMapData as unknown as
    | { newPoolAddress: string }[]
    | null[]
  const parsedData = poolsAddresses.reduce((acc, address, i) => {
    const migrationTarget = migrations?.[i]?.newPoolAddress?.toLowerCase() ?? ""
    if (migrationTarget && !isAddressZero(migrationTarget)) {
      return { [address]: migrationTarget, ...acc }
    }
    return acc
  }, {} as MigrationData)

  return parsedData
}
