import { AddressZero, Zero } from "@ethersproject/constants"
import { BN_1E18, PoolTypes, readableDecimalNumberRegex } from "../constants"
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers"
import {
  MulticallCall,
  MulticallContract,
  MulticallProvider,
} from "../types/ethcall"
import { formatUnits, parseEther, parseUnits } from "@ethersproject/units"

import { BasicPool } from "../providers/BasicPoolsProvider"
import { BasicTokens } from "../providers/TokensProvider"
import { BigNumber } from "@ethersproject/bignumber"
import { ChainId } from "../constants/networks"
import { Contract } from "@ethersproject/contracts"
import { ContractInterface } from "ethers"
import { Deadlines } from "../state/user"
import { Contract as EthcallContract } from "ethcall"
import { ExpandedPool } from "../providers/ExpandedPoolsProvider"
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
import { SupportedNetwork } from "../constants/networks"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { SwapFlashLoanNoWithdrawFee } from "../../types/ethers-contracts/SwapFlashLoanNoWithdrawFee"
import { SwapGuarded } from "../../types/ethers-contracts/SwapGuarded"
import { TokenPricesUSD } from "../state/application"
import { chunk } from "lodash"
import { getAddress } from "@ethersproject/address"
import { intervalToDuration } from "date-fns"
import { minBigNumber } from "./minBigNumber"

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

type PoolAttributes = Partial<
  Pick<BasicPool, "isGuarded" | "isMetaSwap" | "isWithdrawFeeAbi">
> & { isMetaSwapDeposit?: boolean }

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
  const { isGuarded, isMetaSwap, isMetaSwapDeposit, isWithdrawFeeAbi } =
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
  } else if (isWithdrawFeeAbi) {
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

export function getTokenAddrForPoolType(
  poolType: PoolTypes,
  chainId?: ChainId,
): string {
  if (chainId === ChainId.MAINNET) {
    if (poolType === PoolTypes.BTC) {
      return "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599".toLowerCase() // WBTC
    } else if (poolType === PoolTypes.ETH) {
      return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2".toLowerCase() // "WETH"
    } else if (poolType === PoolTypes.USD) {
      return "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48".toLowerCase() // "USDC"
    }
  } else if (chainId === ChainId.HARDHAT) {
    if (poolType === PoolTypes.BTC) {
      return ""
    } else if (poolType === PoolTypes.ETH) {
      return "".toLowerCase() // "WETH"
    } else if (poolType === PoolTypes.USD) {
      return "0x9A676e781A523b5d0C0e43731313A708CB607508".toLowerCase() // "USDC" Hardhat
    }
  } else if (chainId === ChainId.ARBITRUM) {
    if (poolType === PoolTypes.USD) {
      return "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8".toLowerCase() // "USDC" Arbi
    }
  } else if (chainId === ChainId.OPTIMISM) {
    if (poolType === PoolTypes.USD) {
      return "0x7f5c764cbc14f9669b88837ca1490cca17c31607".toLowerCase() // "USDC" OPTIMISM
    }
  } else if (chainId === ChainId.EVMOS) {
    if (poolType === PoolTypes.USD) {
      return "0x51e44ffad5c2b122c8b635671fcc8139dc636e82".toLowerCase() // "USDC" EVMOS
    }
  } else if (chainId === ChainId.KAVA) {
    if (poolType === PoolTypes.USD) {
      return "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f".toLowerCase() // "USDC" KAVA
    }
  } else if (chainId === ChainId.AURORA) {
    if (poolType === PoolTypes.BTC) {
      return "0xF4eB217Ba2454613b15dBdea6e5f22276410e89e".toLowerCase() // WBTC
    } else if (poolType === PoolTypes.ETH) {
      return "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB".toLowerCase() // "WETH"
    } else if (poolType === PoolTypes.USD) {
      return "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802".toLowerCase() // "USDC"
    }
  }

  return ""
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
  } else if (chainId === ChainId.KAVA) {
    ethcallProvider.multicall3 = {
      address: "0x1275203FB58Fc25bC6963B13C2a1ED1541563aF0",
      block: 0,
    }
    ethcallProvider.multicall2 = {
      address: "0x29FD31d37AB8D27f11EAB68F96424bf64231fFce",
      block: 0,
    }
    ethcallProvider.multicall = {
      address: "0x149bBb210051851016F57a2824C0444f642833a6",
      block: 0,
    }
  } else if (chainId === ChainId.AURORA) {
    ethcallProvider.multicall3 = {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
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
  const img = new Image()
  img.src = `/static/icons/svg/${iconName}.svg`

  return img.src
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
 * calculate effective working LP amount that gets applied when user deposits into a gauge with given total LP deposit amount
 * You can compare userLPAmount and the returned value to calculate boost ratio
 * reference https://www.notion.so/saddle-finance/Gauge-Data-1919b6d6317245baa5f58cc25b17ed98#d2025bd485a641fca2730ac617dad82b
 *
 * @param userLPAmount user's lp amount
 * @param totalLPDeposit total lp deposit in the gauge contract
 * @param userBalanceVeSDL user veSDL balance
 * @param totalSupplyVeSDL veSDL total supply
 * @returns return the working amount in BigNumber
 *
 */
export const calculateBoost = (
  userLPAmount: BigNumber,
  totalLPDeposit: BigNumber,
  workingBalances: BigNumber,
  totalWorkingSupply: BigNumber,
  userBalanceVeSDL: BigNumber,
  totalSupplyVeSDL: BigNumber,
): BigNumber | null => {
  if (totalSupplyVeSDL.isZero()) return parseEther("1")

  let lim = userLPAmount.mul(BigNumber.from(40)).div(BigNumber.from(100))

  lim = lim.add(
    totalLPDeposit
      .mul(userBalanceVeSDL)
      .div(totalSupplyVeSDL)
      .mul(BigNumber.from(60))
      .div(BigNumber.from(100)),
  )

  lim = minBigNumber(userLPAmount, lim)

  const noBoostLim = userLPAmount
    .mul(BigNumber.from(40))
    .div(BigNumber.from(100))

  const noBoostSupply = totalWorkingSupply.add(noBoostLim).sub(workingBalances)

  const newWorkingSupply = totalWorkingSupply.add(lim).sub(workingBalances)

  if (newWorkingSupply.mul(noBoostLim).isZero()) return parseEther("1")

  const boost = lim
    .mul(noBoostSupply)
    .mul(parseEther("1"))
    .div(newWorkingSupply.mul(noBoostLim))

  return boost
}

/**
 * Lowercase a list of strings
 *
 * @param strings list of strings
 * @returns lower cased list of strings
 */
export function mapToLowerCase(strings: string[]): string[] {
  return strings.map((address) => address.toLowerCase())
}

/**
 * Verify if an address is Address Zero
 *
 * @param address address string to be verified
 * @returns  boolean check
 */
export function isAddressZero(address: unknown): boolean {
  return address === AddressZero
}

/**
 * Resolve multicall promises in chunks
 *
 * @param multiCallCalls
 * @param ethCallProvider
 * @param chunkSize
 * @returns
 */
export async function chunkedTryAll<T>(
  multiCallCalls: MulticallCall<unknown, T>[],
  ethCallProvider: MulticallProvider,
  chunkSize: number,
): Promise<(T | null)[]> {
  const multicallCallChunk = chunk(multiCallCalls, chunkSize).map((batch) =>
    ethCallProvider.tryAll(batch),
  )
  return (await Promise.all(multicallCallChunk)).flat()
}

export type DeepNullable<T> = {
  [K in keyof T]: DeepNullable<T[K]> | null
}

export const arrayToHashmap = <K extends string | number, V>(
  array: [K, V][],
): { [key: string]: V } =>
  Object.assign({}, ...array.map(([key, val]) => ({ [key]: val }))) as {
    [key: string]: V
  }
/**
 *
 * @param str string
 * @returns boolean check
 */
export const isNumberOrEmpty = (str: string): boolean => {
  return readableDecimalNumberRegex.test(str) || str === ""
}

/**
 * Return the strict structure required by the `wallet_addEthereumChain` call
 */
export function extractAddEthereumChainArgs(
  networkObj: SupportedNetwork,
): SupportedNetwork {
  const { chainId, chainName, rpcUrls, blockExplorerUrls, nativeCurrency } =
    networkObj
  const { name, symbol, decimals } = nativeCurrency
  return {
    chainId,
    chainName,
    rpcUrls,
    blockExplorerUrls,
    nativeCurrency: {
      name,
      symbol,
      decimals,
    },
  }
}

export function calculateFraction(
  numerator: BigNumber,
  divisor: BigNumber,
): BigNumber {
  return divisor.isZero() ? Zero : numerator.mul(BN_1E18).div(divisor) // returns 1e18
}

export function getPriceDataForPool(
  tokens: BasicTokens,
  basicPool: BasicPool,
  tokenPricesUSD?: TokenPricesUSD,
  chainId?: ChainId,
): {
  assetPrice: BigNumber
  lpTokenPriceUSD: BigNumber
  tokenBalancesUSD: BigNumber[]
  underlyingTokenBalancesUSD: BigNumber[]
  tokenBalancesSumUSD: BigNumber
  tokenBalances1e18: BigNumber[]
  underlyingTokenBalances1e18: BigNumber[]
  totalLocked: BigNumber
} {
  const {
    typeOfAsset,
    tokens: poolTokens,
    tokenBalances,
    lpTokenSupply,
    underlyingTokenBalances,
    underlyingTokens,
  } = basicPool
  const poolAssetPrice = parseUnits(
    String(
      tokenPricesUSD?.[getTokenAddrForPoolType(typeOfAsset, chainId)] || 0,
    ),
    18,
  )
  const expandedTokens = poolTokens.map((token) => (tokens || {})[token])
  const expandedUnderlyingTokens = underlyingTokens
    ? underlyingTokens.map((token) => (tokens || {})[token])
    : []
  const tokenBalances1e18 = tokenBalances.map((balance, i) =>
    balance.mul(
      BigNumber.from(10).pow(18 - (expandedTokens[i]?.decimals || 0)),
    ),
  )
  const tokenBalancesSum1e18 = tokenBalances1e18.reduce(bnSum, Zero)
  const tokenBalancesUSD = tokenBalances1e18.map((balance) =>
    balance.mul(poolAssetPrice).div(BN_1E18),
  )
  const tokenBalancesSumUSD = tokenBalancesUSD.reduce(bnSum, Zero)

  const underlyingTokenBalances1e18 =
    expandedUnderlyingTokens && underlyingTokenBalances
      ? underlyingTokenBalances.map((balance, i) =>
          balance.mul(
            BigNumber.from(10).pow(
              18 - (expandedUnderlyingTokens[i]?.decimals || 0),
            ),
          ),
        )
      : []
  const underlyingTokenBalancesUSD = underlyingTokenBalances1e18.map(
    (balance) => balance.mul(poolAssetPrice).div(BN_1E18),
  )

  const lpTokenPriceUSD = lpTokenSupply.isZero()
    ? Zero
    : tokenBalancesSumUSD.mul(BN_1E18).div(lpTokenSupply)
  return {
    assetPrice: poolAssetPrice,
    lpTokenPriceUSD,
    tokenBalancesUSD,
    tokenBalancesSumUSD,
    tokenBalances1e18,
    totalLocked: tokenBalancesSum1e18,
    underlyingTokenBalances1e18,
    underlyingTokenBalancesUSD,
  }
}

export function getPriceDataForExpandedPool(
  expandedPool: ExpandedPool,
  chainId: ChainId,
  tokenPricesUSD?: TokenPricesUSD,
): {
  assetPrice: BigNumber
  lpTokenPriceUSD: BigNumber
  tokenBalancesUSD: BigNumber[]
  underlyingTokenBalancesUSD: BigNumber[]
  tokenBalancesSumUSD: BigNumber
  tokenBalances1e18: BigNumber[]
  underlyingTokenBalances1e18: BigNumber[]
  totalLocked: BigNumber
} {
  const {
    typeOfAsset,
    tokens,
    tokenBalances,
    lpTokenSupply,
    underlyingTokenBalances,
    underlyingTokens,
  } = expandedPool
  const poolAssetPrice = parseUnits(
    String(
      tokenPricesUSD?.[getTokenAddrForPoolType(typeOfAsset, chainId)] ?? 0,
    ),
    18,
  )
  const tokenBalances1e18 = tokenBalances.map((balance, i) =>
    balance.mul(BigNumber.from(10).pow(18 - (tokens[i].decimals || 0))),
  )
  const tokenBalancesSum1e18 = tokenBalances1e18.reduce(bnSum, Zero)
  const tokenBalancesUSD = tokenBalances1e18.map((balance) =>
    balance.mul(poolAssetPrice).div(BN_1E18),
  )
  const tokenBalancesSumUSD = tokenBalancesUSD.reduce(bnSum, Zero)

  const underlyingTokenBalances1e18 =
    underlyingTokens && underlyingTokenBalances
      ? underlyingTokenBalances.map((balance, i) =>
          balance.mul(
            BigNumber.from(10).pow(18 - (underlyingTokens[i].decimals || 0)),
          ),
        )
      : []
  const underlyingTokenBalancesUSD = underlyingTokenBalances1e18.map(
    (balance) => balance.mul(poolAssetPrice).div(BN_1E18),
  )

  const lpTokenPriceUSD = lpTokenSupply.isZero()
    ? Zero
    : tokenBalancesSumUSD.mul(BN_1E18).div(lpTokenSupply)
  return {
    assetPrice: poolAssetPrice,
    lpTokenPriceUSD,
    tokenBalancesUSD,
    tokenBalancesSumUSD,
    tokenBalances1e18,
    totalLocked: tokenBalancesSum1e18,
    underlyingTokenBalancesUSD,
    underlyingTokenBalances1e18,
  }
}

export function missingKeys(itemsMap: { [key: string]: unknown }): string[] {
  return Object.keys(itemsMap)
    .map((key) => itemsMap[key] == null && key)
    .filter(Boolean) as string[]
}

export function getIntervalBetweenTwoDates(
  firstDate: Date | null,
  secondDate: Date | null,
): Duration {
  const firstDateInSeconds = firstDate
    ? firstDate.valueOf()
    : new Date().valueOf()
  const secondDateInSeconds = secondDate
    ? secondDate.valueOf()
    : new Date().valueOf()
  const startDate = new Date(Math.min(firstDateInSeconds, secondDateInSeconds))
  const endDate = new Date(Math.max(firstDateInSeconds, secondDateInSeconds))

  return intervalToDuration({ start: startDate, end: endDate })
}
