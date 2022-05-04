import { ethers } from "ethers"

export async function getCurrentBlockTimestamp(): Promise<number> {
  const block = await ethers.getDefaultProvider().getBlock("latest")
  return block.timestamp
}
