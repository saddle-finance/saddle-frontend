import { ChainId, TOKENS_MAP, Token } from "../constants"
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers"

import { AddressZero } from "@ethersproject/constants"
import { BigNumber } from "@ethersproject/bignumber"
import { Contract } from "@ethersproject/contracts"
import { ContractInterface } from "ethers"
import { Deadlines } from "../state/user"
import { formatUnits } from "@ethersproject/units"
import { getAddress } from "@ethersproject/address"

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: string): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

// account is not optional
export function getSigner(
  library: Web3Provider,
  account: string,
): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(
  library: Web3Provider,
  account?: string,
): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(
  address: string,
  ABI: ContractInterface,
  library: Web3Provider,
  account?: string,
): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account))
}

export function formatBNToString(
  bn: BigNumber,
  nativePrecison: number,
  decimalPlaces?: number,
): string {
  const fullPrecision = formatUnits(bn, nativePrecison)
  const decimalIdx = fullPrecision.indexOf(".")
  return decimalPlaces === undefined || decimalIdx === -1
    ? fullPrecision
    : fullPrecision.slice(
        0,
        decimalIdx + (decimalPlaces > 0 ? decimalPlaces + 1 : 0), // don't include decimal point if places = 0
      )
}

export function formatBNToPercentString(
  bn: BigNumber,
  nativePrecison: number,
  decimalPlaces = 2,
): string {
  return `${formatBNToString(bn, nativePrecison - 2, decimalPlaces)}%`
}

export function shiftBNDecimals(bn: BigNumber, shiftAmount: number): BigNumber {
  if (shiftAmount < 0) throw new Error("shiftAmount must be positive")
  return bn.mul(BigNumber.from(10).pow(shiftAmount))
}

export function calculateExchangeRate(
  amountFrom: BigNumber,
  tokenPrecisionFrom: number,
  amountTo: BigNumber,
  tokenPrecisionTo: number,
): BigNumber {
  return amountFrom.gt("0")
    ? amountTo
        .mul(BigNumber.from(10).pow(36 - tokenPrecisionTo)) // convert to standard 1e18 precision
        .div(amountFrom.mul(BigNumber.from(10).pow(18 - tokenPrecisionFrom)))
    : BigNumber.from("0")
}

export function formatDeadlineToNumber(
  deadlineSelected: Deadlines,
  deadlineCustom?: string,
): number {
  let deadline
  if (deadlineSelected === Deadlines.Thirty) {
    deadline = 30
  } else if (deadlineSelected === Deadlines.Custom) {
    deadline = +(deadlineCustom || 10)
  } else {
    deadline = 10
  }
  return deadline
}

// A better version of ether's commify util
export function commify(str: string): string {
  const parts = str.split(".")
  if (parts.length > 2) throw new Error("commify string cannot have > 1 period")
  const [partA, partB] = parts
  if (partA.length === 0) return partB === undefined ? "" : `.${partB}`
  const mod = partA.length % 3
  const div = Math.floor(partA.length / 3)
  // define a fixed length array given the expected # of commas added
  const commaAArr = new Array(partA.length + (mod === 0 ? div - 1 : div))
  // init pointers for original string and for commified array
  let commaAIdx = commaAArr.length - 1
  // iterate original string backwards from the decimals since that's how commas are added
  for (let i = partA.length - 1; i >= 0; i--) {
    // revIdx is the distance from the decimal place eg "3210."
    const revIdx = partA.length - 1 - i
    // add the character to the array
    commaAArr[commaAIdx--] = partA[i]
    // add a comma if we are a multiple of 3 from the decimal
    if ((revIdx + 1) % 3 === 0) {
      commaAArr[commaAIdx--] = ","
    }
  }
  const commifiedA = commaAArr.join("")
  return partB === undefined ? commifiedA : `${commifiedA}.${partB}`
}

export function intersection<T>(set1: Set<T>, set2: Set<T>): Set<T> {
  return new Set([...set1].filter((item) => set2.has(item)))
}

export function getTokenByAddress(
  address: string,
  chainId: ChainId,
): Token | null {
  return (
    Object.values(TOKENS_MAP).find(
      ({ addresses }) =>
        addresses[chainId] &&
        address.toLowerCase() === addresses[chainId].toLowerCase(),
    ) || null
  )
}
