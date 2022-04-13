import {
  ChainId,
  GENERALIZED_SWAP_MIGRATOR_CONTRACT_ADDRESSES,
} from "../constants"
import { MulticallContract, MulticallProvider } from "../types/ethcall"

import { AddressZero } from "@ethersproject/constants"
import { Contract } from "ethcall"
import GENERALIZED_SWAP_MIGRATOR_CONTRACT_ABI from "../constants/abis/generalizedSwapMigrator.json"
import { GeneralizedSwapMigrator } from "../../types/ethers-contracts/GeneralizedSwapMigrator"

type MigrationData = { [poolAddress: string]: string } // current poolAddress => new poolAddress

/**
 * Returns old -> new pool address mappings from GeneralizedMigrator for the given pool addresses.
 */
export async function getMigrationData(
  ethCallProvider: MulticallProvider,
  chainId: ChainId,
  poolAddresses: string[],
): Promise<MigrationData | null> {
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
    const results = await ethCallProvider.tryEach(
      calls,
      Array(calls.length).fill(true),
    )
    const parsedData = poolAddresses.reduce((acc, address, i) => {
      const result = results[i]?.newPoolAddress
      if (result && result !== AddressZero) {
        return { [address]: result, ...acc }
      }
      return acc
    }, {} as MigrationData)
    return parsedData
  } catch (e) {
    const error = new Error(`Failed to get migration data`)
    error.stack = (e as Error).stack
    console.error(error)
    return null
  }
}
