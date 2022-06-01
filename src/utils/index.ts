import { AddressZero, Zero } from "@ethersproject/constants"
import { ChainId, PoolTypes, TOKENS_MAP, Token } from "../constants"
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers"
import {
  MulticallCall,
  MulticallContract,
  MulticallProvider,
} from "../types/ethcall"
import { formatUnits, parseUnits } from "@ethersproject/units"

import { BigNumber } from "@ethersproject/bignumber"
import { Contract } from "@ethersproject/contracts"
import { ContractInterface } from "ethers"
import { Deadlines } from "../state/user"
import { Contract as EthcallContract } from "ethcall"
import { JsonFragment } from "@ethersproject/abi"
import META_SWAP_ABI from "../constants/abis/metaSwap.json"
import META_SWAP_DEPOSIT_ABI from "../constants/abis/metaSwapDeposit.json"
import { MetaSwap } from "../../types/ethers-contracts/MetaSwap"
import { MetaSwapDeposit } from "../../types/ethers-contracts/MetaSwapDeposit"
import { Provider } from "ethcall"
import SWAP_FLASH_LOAN_ABI from "../constants/abis/swapFlashLoan.json"
import SWAP_FLASH_LOAN_NO_WITHDRAW_FEE_ABI from "../constants/abis/swapFlashLoanNoWithdrawFee.json"
import SWAP_GUARDED_ABI from "../constants/abis/swapGuarded.json"
import { SYNTHETIX_TOKENS } from "./../constants/index"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { SwapFlashLoanNoWithdrawFee } from "../../types/ethers-contracts/SwapFlashLoanNoWithdrawFee"
import { SwapGuarded } from "../../types/ethers-contracts/SwapGuarded"
import { TokenPricesUSD } from "../state/application"
import { chunk } from "lodash"
import { getAddress } from "@ethersproject/address"

export function isSynthAsset(chainId: ChainId, tokenAddress: string): boolean {
  return SYNTHETIX_TOKENS[chainId]?.includes(tokenAddress) || false
}

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: string): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

export function enumerate(length: number, start = 0): number[] {
  return Array.from(Array(length).keys()).map((x) => x + start)
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

interface PoolAttributes {
  isGuarded?: boolean
  isMetaSwap?: boolean
  isMetaSwapDeposit?: boolean
  isLegacySwap?: boolean
}

export function getSwapContract(
  library: Web3Provider,
  address: string,
  poolAttributes: PoolAttributes,
  account?: string,
):
  | SwapGuarded
  | SwapFlashLoan
  | SwapFlashLoanNoWithdrawFee
  | MetaSwap
  | MetaSwapDeposit
  | null {
  const { isGuarded, isMetaSwap, isMetaSwapDeposit, isLegacySwap } =
    poolAttributes

  // address error cases
  if (!address) {
    throw new Error("Pool address not provided")
  }
  if (isMetaSwap && isGuarded) {
    throw new Error("Unsupported ABI")
  }

  // get contract
  if (isGuarded) {
    return getContract(
      address,
      SWAP_GUARDED_ABI,
      library,
      account ?? undefined,
    ) as SwapGuarded
  } else if (isLegacySwap) {
    return getContract(
      address,
      SWAP_FLASH_LOAN_ABI,
      library,
      account ?? undefined,
    ) as SwapFlashLoan
  } else if (isMetaSwapDeposit) {
    // @dev it's important that this comes before isMetaSwap check
    return getContract(
      address,
      META_SWAP_DEPOSIT_ABI,
      library,
      account ?? undefined,
    ) as MetaSwapDeposit
  } else if (isMetaSwap) {
    return getContract(
      address,
      META_SWAP_ABI,
      library,
      account ?? undefined,
    ) as MetaSwap
  } else {
    return getContract(
      address,
      SWAP_FLASH_LOAN_NO_WITHDRAW_FEE_ABI,
      library,
      account ?? undefined,
    ) as SwapFlashLoanNoWithdrawFee
  }
}

export function batchArray<T>(array: T[], batchSize: number): T[][] {
  const batches = []
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize))
  }
  return batches
}

export function getTokenUSDValueByType(
  tokenAmount: BigNumber,
  typeOfAsset: PoolTypes,
  tokenPricesUSD?: TokenPricesUSD,
): BigNumber {
  let tokenValue = 0
  if (typeOfAsset === PoolTypes.BTC) {
    tokenValue = tokenPricesUSD?.BTC || 0
  } else if (typeOfAsset === PoolTypes.ETH) {
    tokenValue = tokenPricesUSD?.ETH || 0
  } else {
    tokenValue = 1 // USD
  }
  return parseUnits(tokenValue.toFixed(2), 2)
    .mul(tokenAmount)
    .div(BigNumber.from(10).pow(2)) //1e18
}

export function formatBNToShortString(
  bn: BigNumber,
  nativePrecision: number,
): string {
  const bnStr = bn.toString()
  const numLen = bnStr.length - nativePrecision
  if (numLen <= 0) return "0.0"
  const div = Math.floor((numLen - 1) / 3)
  const mod = numLen % 3
  const suffixes = ["", "k", "m", "b", "t"]
  return `${bnStr.substr(0, mod || 3)}.${bnStr[mod || 3]}${suffixes[div]}`
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

export function bnSum(a: BigNumber, b: BigNumber): BigNumber {
  return a.add(b)
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
  let deadline = 20
  switch (deadlineSelected) {
    case Deadlines.Ten:
      deadline = 10
      break
    case Deadlines.Twenty:
      deadline = 20
      break
    case Deadlines.Thirty:
      deadline = 30
      break
    case Deadlines.Forty:
      deadline = 40
      break
    case Deadlines.Custom:
      deadline = +(deadlineCustom || formatDeadlineToNumber(Deadlines.Twenty))
      break
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

export function calculatePrice(
  amount: BigNumber | string,
  tokenPrice = 0,
  decimals?: number,
): BigNumber {
  // returns amount * price as BN 18 precision
  if (typeof amount === "string") {
    if (isNaN(+amount)) return Zero
    return parseUnits((+amount * tokenPrice).toFixed(2), 18)
  } else if (decimals != null) {
    return amount
      .mul(parseUnits(tokenPrice.toFixed(2), 18))
      .div(BigNumber.from(10).pow(decimals))
  }
  return Zero
}

export function getTokenSymbolForPoolType(poolType: PoolTypes): string {
  // TODO modify for native assets (eg ETH vs FTM)
  if (poolType === PoolTypes.BTC) {
    return "WBTC"
  } else if (poolType === PoolTypes.ETH) {
    return "WETH"
  } else if (poolType === PoolTypes.USD) {
    return "USDC"
  } else {
    return ""
  }
}

export async function getMulticallProvider(
  library: Web3Provider,
  chainId: ChainId,
): Promise<MulticallProvider> {
  const ethcallProvider = new Provider() as unknown as MulticallProvider
  await ethcallProvider.init(library)
  if (chainId === ChainId.HARDHAT) {
    ethcallProvider.multicall3 = {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      block: 0,
    }
    ethcallProvider.multicall = {
      address: "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f",
      block: 0,
    }
  } else if (chainId === ChainId.EVMOS) {
    ethcallProvider.multicall3 = {
      address: "0xAfbFD3e9E426a28A7a1b0CD1D44089A5B63B4335",
      block: 0,
    }
    ethcallProvider.multicall2 = {
      address: "0x3A0c2A793a8DB779e0293699D0Ce77c77617FE0f",
      block: 0,
    }
    ethcallProvider.multicall = {
      address: "0x98D2aFc66DE1F73598c6CFa35cbdfebB135fb8FA",
      block: 0,
    }
  } else if (chainId === ChainId.KAVA_TESTNET) {
    ethcallProvider.multicall3 = {
      address: "0x9AA75e03e93f69E1F399ddeD0dA5fFCbE914D099",
      block: 0,
    }
    ethcallProvider.multicall2 = {
      address: "0xA4fe4981f7550884E7E6224F0c78245DC145b2F2",
      block: 0,
    }
    ethcallProvider.multicall = {
      address: "0xBC22B8E74E7fe2E217b295f4a3e1a9E8e182BECD",
      block: 0,
    }
  }

  return ethcallProvider
}

/**
 * Get icon path from token's symbol
 *
 * @param tokenSymbol
 * @returns the token icon path within the public assets directory
 */
export function getTokenIconPath(tokenSymbol: string): string {
  const iconName = tokenSymbol.toLowerCase().includes("saddle")
    ? "saddle_lp_token"
    : tokenSymbol.toLowerCase()

  return `/static/icons/svg/${iconName}.svg`
}

/**
 * Create a multicall version of the selected smart contract
 *
 * @param contractAddress
 * @param contractAbi
 * @returns the multicall wrapped version of the smart contract
 *
 */
export function createMultiCallContract<T>(
  contractAddress: string,
  contractAbi: JsonFragment[],
): MulticallContract<T> {
  return new EthcallContract(
    contractAddress,
    contractAbi,
  ) as MulticallContract<T>
}

/**
 * Generate the snapshot vote URL from ID
 *
 * @param id ID of snapshot
 * @returns the snapshot URL
 */
export function generateSnapshotVoteLink(id?: string): string {
  if (id) return `https://snapshot.org/#/saddlefinance.eth/proposal/${id}`
  return "https://snapshot.org/#/saddlefinance.eth"
}

/**
 * Lowercase a list of addresses
 *
 * @param addresses list of addresses
 * @returns lower cased list of addresses
 */
export function lowerCaseAddresses(addresses: string[]): string[] {
  return addresses.map((address) => address.toLowerCase())
}

/**
 * Verify if an address is Address Zero
 *
 * @param address address string to be verified
 * @returns  boolean check
 */
export function isAddressZero(address: string | null): boolean {
  return address === AddressZero
}

/**
 * Resolve multicall promises in batch sizes
 *
 * @param multiCallCalls
 * @param ethCallProvider
 * @param batchSize
 * @returns
 */
export async function multicallInBatch<T>(
  multiCallCalls: MulticallCall<unknown, T>[],
  ethCallProvider: MulticallProvider,
  batchSize: number,
): Promise<(T | null)[]> {
  const multiCallCallsBatch = chunk(multiCallCalls, batchSize).map((batch) =>
    ethCallProvider.tryAll(batch),
  )
  return (await Promise.all(multiCallCallsBatch)).flat()
}

export type DeepNullable<T> = {
  [K in keyof T]: DeepNullable<T[K]> | null
}
