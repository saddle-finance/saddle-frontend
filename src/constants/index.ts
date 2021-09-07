import { injected, walletconnect, walletlink } from "../connectors"

import { AbstractConnector } from "@web3-react/abstract-connector"
import { BigNumber } from "@ethersproject/bignumber"
import coinbasewalletIcon from "../assets/icons/coinbasewallet.svg"
import daiLogo from "../assets/icons/dai.svg"
import metamaskIcon from "../assets/icons/metamask.svg"
import saddleLogo from "../assets/icons/logo_24.svg"
import usdcLogo from "../assets/icons/usdc.svg"
import usdtLogo from "../assets/icons/usdt.svg"
import walletconnectIcon from "../assets/icons/walletconnect.svg"

export const NetworkContextName = "NETWORK"
export const STABLECOIN_POOL_NAME = "Stablecoin Pool"
export type PoolName = typeof STABLECOIN_POOL_NAME

export enum ChainId {
  // MAINNET = 1,
  // ROPSTEN = 3,
  // RINKEBY = 4,
  // GÖRLI = 5,
  OPTIMISTIC_MAINNET = 10,
  // KOVAN = 42,
  OPTIMISTIC_KOVAN = 69,
  // HARDHAT = 31337,
}
export enum PoolTypes {
  BTC,
  ETH,
  USD,
  OTHER,
}

export class Token {
  readonly addresses: { [chainId in ChainId]: string }
  readonly decimals: number
  readonly symbol: string
  readonly name: string
  readonly icon: string
  readonly geckoId: string
  readonly isSynthetic: boolean
  readonly isLPToken: boolean

  constructor(
    addresses: { [chainId in ChainId]: string },
    decimals: number,
    symbol: string,
    geckoId: string,
    name: string,
    icon: string,
    isSynthetic = false,
    isLPToken = false,
  ) {
    this.addresses = addresses
    this.decimals = decimals
    this.symbol = symbol
    this.geckoId = geckoId
    this.name = name
    this.icon = icon
    this.isSynthetic = isSynthetic
    this.isLPToken = isLPToken
  }
}

export const BLOCK_TIME = 13000 // ms

export const BRIDGE_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.OPTIMISTIC_MAINNET]: "", // TODO replace once mainnet deploy goes out
  [ChainId.OPTIMISTIC_KOVAN]: "",
}

export const SWAP_MIGRATOR_USD_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.OPTIMISTIC_MAINNET]: "", // TODO replace once mainnet deploy goes out
  [ChainId.OPTIMISTIC_KOVAN]: "",
}

export const STABLECOIN_SWAP_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.OPTIMISTIC_MAINNET]: "", // TODO replace once mainnet deploy goes out
  [ChainId.OPTIMISTIC_KOVAN]: "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1",
}

export const STABLECOIN_SWAP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.OPTIMISTIC_MAINNET]: "", // TODO replace once mainnet deploy goes out
  [ChainId.OPTIMISTIC_KOVAN]: "0x56639dB16Ac50A89228026e42a316B30179A5376",
}

export const STABLECOIN_SWAP_TOKEN = new Token(
  STABLECOIN_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "oSaddleUSD",
  "osaddleusd",
  "Optimism Saddle DAI/USDC/USDT",
  saddleLogo,
  false,
  true,
)

// Stablecoins
const DAI_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.OPTIMISTIC_MAINNET]: "", // TODO replace once mainnet deploy goes out
  [ChainId.OPTIMISTIC_KOVAN]: "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44",
}
export const DAI = new Token(
  DAI_CONTRACT_ADDRESSES,
  18,
  "DAI",
  "dai",
  "Dai",
  daiLogo,
)

const USDC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.OPTIMISTIC_MAINNET]: "", // TODO replace once mainnet deploy goes out
  [ChainId.OPTIMISTIC_KOVAN]: "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f",
}
export const USDC = new Token(
  USDC_CONTRACT_ADDRESSES,
  6,
  "USDC",
  "usd-coin",
  "USDC Coin",
  usdcLogo,
)

const USDT_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.OPTIMISTIC_MAINNET]: "", // TODO replace once mainnet deploy goes out
  [ChainId.OPTIMISTIC_KOVAN]: "0x4A679253410272dd5232B3Ff7cF5dbB88f295319",
}
export const USDT = new Token(
  USDT_CONTRACT_ADDRESSES,
  6,
  "USDT",
  "tether",
  "Tether",
  usdtLogo,
)

export const STABLECOIN_POOL_TOKENS = [DAI, USDC, USDT]

export type Pool = {
  name: PoolName
  lpToken: Token
  poolTokens: Token[]
  isSynthetic: boolean
  addresses: { [chainId in ChainId]: string }
  type: PoolTypes
  route: string
  migration?: PoolName
  metaSwapAddresses?: { [chainId in ChainId]: string }
  underlyingPoolTokens?: Token[]
  isOutdated?: boolean // pool can be outd  ated but not have a migration target
}
export type PoolsMap = {
  [poolName: string]: Pool
}
export const POOLS_MAP: PoolsMap = {
  [STABLECOIN_POOL_NAME]: {
    name: STABLECOIN_POOL_NAME,
    addresses: STABLECOIN_SWAP_ADDRESSES,
    lpToken: STABLECOIN_SWAP_TOKEN,
    poolTokens: STABLECOIN_POOL_TOKENS,
    isSynthetic: false,
    type: PoolTypes.USD,
    route: "usd",
  },
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isLegacySwapABIPool(poolName: string): boolean {
  return false
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isMetaPool(poolName = ""): boolean {
  return false
}

// maps a symbol string to a token object
export type TokensMap = {
  [symbol: string]: Token
}

export const TOKENS_MAP = Object.keys(POOLS_MAP).reduce((acc, poolName) => {
  const pool = POOLS_MAP[poolName as PoolName]
  const newAcc = { ...acc }
  pool.poolTokens.forEach((token) => {
    newAcc[token.symbol] = token
  })
  newAcc[pool.lpToken.symbol] = pool.lpToken
  return newAcc
}, {} as TokensMap)

export type TokenToPoolsMap = {
  [tokenSymbol: string]: string[]
}
export const TOKEN_TO_POOLS_MAP = Object.keys(POOLS_MAP).reduce(
  (acc, poolName) => {
    const pool = POOLS_MAP[poolName as PoolName]
    const newAcc = { ...acc }
    pool.poolTokens.forEach((token) => {
      newAcc[token.symbol] = (newAcc[token.symbol] || []).concat(
        poolName as PoolName,
      )
    })
    return newAcc
  },
  {} as TokenToPoolsMap,
)

export const TRANSACTION_TYPES = {
  DEPOSIT: "DEPOSIT",
  WITHDRAW: "WITHDRAW",
  SWAP: "SWAP",
  MIGRATE: "MIGRATE",
}

export const POOL_FEE_PRECISION = 10

export enum SWAP_TYPES {
  DIRECT = "swapDirect", // route length 2
  SYNTH_TO_SYNTH = "swapSynthToSynth", // route length 2
  SYNTH_TO_TOKEN = "swapSynthToToken", // route length 3
  TOKEN_TO_SYNTH = "swapTokenToSynth", // route length 3
  TOKEN_TO_TOKEN = "swapTokenToToken", // route length 4
  INVALID = "invalid",
}

export function getIsVirtualSwap(swapType: SWAP_TYPES): boolean {
  return (
    swapType === SWAP_TYPES.SYNTH_TO_SYNTH ||
    swapType === SWAP_TYPES.SYNTH_TO_TOKEN ||
    swapType === SWAP_TYPES.TOKEN_TO_SYNTH ||
    swapType === SWAP_TYPES.TOKEN_TO_TOKEN
  )
}

export const SWAP_CONTRACT_GAS_ESTIMATES_MAP = {
  [SWAP_TYPES.INVALID]: BigNumber.from("999999999"), // 999,999,999
  [SWAP_TYPES.DIRECT]: BigNumber.from("200000"), // 157,807
  [SWAP_TYPES.TOKEN_TO_TOKEN]: BigNumber.from("2000000"), // 1,676,837
  [SWAP_TYPES.TOKEN_TO_SYNTH]: BigNumber.from("2000000"), // 1,655,502
  [SWAP_TYPES.SYNTH_TO_TOKEN]: BigNumber.from("1500000"), // 1,153,654
  [SWAP_TYPES.SYNTH_TO_SYNTH]: BigNumber.from("999999999"), // 999,999,999 // TODO: https://github.com/saddle-finance/saddle-frontend/issues/471
  addLiquidity: BigNumber.from("400000"), // 386,555
  removeLiquidityImbalance: BigNumber.from("350000"), // 318,231
  removeLiquidityOneToken: BigNumber.from("250000"), // 232,947
  migrate: BigNumber.from("650000"), // 619,126
}

export interface WalletInfo {
  name: string
  icon: string
  connector: AbstractConnector
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  METAMASK: {
    name: "MetaMask",
    icon: metamaskIcon,
    connector: injected,
  },
  WALLET_CONNECT: {
    name: "WalletConnect",
    icon: walletconnectIcon,
    connector: walletconnect,
  },
  WALLET_LINK: {
    name: "Coinbase Wallet",
    icon: coinbasewalletIcon,
    connector: walletlink,
  },
}

// FLAGS
export const IS_VIRTUAL_SWAP_ACTIVE = false
// FLAGS END
