import { ChainId, POOLS_MAP, Pool } from "../constants"
import { find } from "lodash"

export function getPoolByAddress(
  targetAddress: string,
  chainId: ChainId,
): Pool | undefined {
  return find(POOLS_MAP, (pool) => {
    return pool.addresses[chainId].toLowerCase() === targetAddress
  })
}
