import { BigNumber } from "ethers"
import { SWAP_TYPES } from "../constants"

export interface TokenOption {
  address: string
  symbol: string
  name: string
  valueUSD: BigNumber
  amount: BigNumber
  decimals: number
  swapType: SWAP_TYPES | null
  isAvailable: boolean
  isOnTokenLists: boolean
}
