import {
  ChainId,
  MINICHEF_CONTRACT_ADDRESSES,
  getMinichefPid,
} from "../constants"
import { MulticallContract, MulticallProvider } from "../types/ethcall"

import { BigNumber } from "@ethersproject/bignumber"
import { Contract } from "ethcall"
import MINICHEF_CONTRACT_ABI from "../constants/abis/miniChef.json"
import { MiniChef } from "../../types/ethers-contracts/MiniChef"

type MinichefData = {
  [poolAddress: string]: { sdlPerDay: BigNumber; pid: number }
}

/**
 * Returns sdlPerDay and pid from minichef for the given pool addresses.
 */
export async function getMinichefRewardsData(
  ethCallProvider: MulticallProvider,
  chainId: ChainId,
  poolAddresses: string[],
): Promise<MinichefData | null> {
  const minichefAddress = MINICHEF_CONTRACT_ADDRESSES[chainId]
  const addressesPidTuples = poolAddresses
    .map((poolAddress) => [poolAddress, getMinichefPid(chainId, poolAddress)])
    .filter(([, pid]) => !!pid) as [string, number][]
  if (!addressesPidTuples.length || !minichefAddress || !ethCallProvider)
    return null
  try {
    const minichefContract = new Contract(
      minichefAddress,
      MINICHEF_CONTRACT_ABI,
    ) as MulticallContract<MiniChef>

    const [saddlePerSecond, totalAllocPoint] = await ethCallProvider.tryEach(
      [minichefContract.saddlePerSecond(), minichefContract.totalAllocPoint()],
      [false, false],
    )

    const poolInfos = await ethCallProvider.tryEach(
      addressesPidTuples.map(([, pid]) => minichefContract.poolInfo(pid)),
      Array(addressesPidTuples.length).fill(true),
    )
    const oneDaySecs = BigNumber.from(24 * 60 * 60)
    return addressesPidTuples.reduce((acc, [address, pid], i) => {
      const poolInfo = poolInfos[i]
      if (poolInfo) {
        const sdlPerDay = saddlePerSecond
          .mul(oneDaySecs)
          .mul(poolInfo.allocPoint)
          .div(totalAllocPoint)
        return {
          [address]: { sdlPerDay, pid },
          ...acc,
        }
      }
      return acc
    }, {} as MinichefData)
  } catch (e) {
    const error = e as Error
    error.message = `Failed to get minichef data; ${error.message}`
    console.error(error)
    return null
  }
}
