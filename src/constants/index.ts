import { BigNumber } from "@ethersproject/bignumber"
import daiLogo from "../assets/icons/dai.svg"
import renbtcLogo from "../assets/icons/renbtc.svg"
import saddleLogo from "../assets/icons/logo.svg"
import sbtcLogo from "../assets/icons/sbtc.svg"
import tbtcLogo from "../assets/icons/tbtc.svg"
import usdcLogo from "../assets/icons/usdc.svg"
import usdtLogo from "../assets/icons/usdt.svg"
import veth2Logo from "../assets/icons/veth2.svg"
import wbtcLogo from "../assets/icons/wbtc.svg"
import wethLogo from "../assets/icons/weth.svg"

export const NetworkContextName = "NETWORK"
export const BTC_POOL_NAME = "BTC Pool"
export const STABLECOIN_POOL_NAME = "Stablecoin Pool"
export const VETH2_POOL_NAME = "vETH2 Pool"
export type PoolName =
  | typeof BTC_POOL_NAME
  | typeof STABLECOIN_POOL_NAME
  | typeof VETH2_POOL_NAME

export enum ChainId {
  MAINNET = 1,
  // ROPSTEN = 3,
  // RINKEBY = 4,
  // GÖRLI = 5,
  // KOVAN = 42,
  HARDHAT = 31337,
}

export class Token {
  readonly addresses: { [chainId in ChainId]: string }
  readonly decimals: number
  readonly symbol: string
  readonly name: string
  readonly icon: string
  readonly geckoId: string

  constructor(
    addresses: { [chainId in ChainId]: string },
    decimals: number,
    symbol: string,
    geckoId: string,
    name: string,
    icon: string,
  ) {
    this.addresses = addresses
    this.decimals = decimals
    this.symbol = symbol
    this.geckoId = geckoId
    this.name = name
    this.icon = icon
  }
}

export const BLOCK_TIME = 15000

export const STABLECOIN_SWAP_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x3911F80530595fBd01Ab1516Ab61255d75AEb066",
  [ChainId.HARDHAT]: "0x856e4424f806D16E8CBC702B3c0F2ede5468eae5",
}

export const BTC_SWAP_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x4f6A43Ad7cba042606dECaCA730d4CE0A57ac62e",
  [ChainId.HARDHAT]: "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
}

export const VETH2_SWAP_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xdec2157831D6ABC3Ec328291119cc91B337272b5",
  [ChainId.HARDHAT]: "0xb0279Db6a2F1E01fbC8483FCCef0Be2bC6299cC3",
}

export const MERKLETREE_DATA: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "mainnetTestAccounts.json",
  [ChainId.HARDHAT]: "hardhat.json",
}

export const STABLECOIN_SWAP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: "0x76204f8CFE8B95191A3d1CfA59E267EA65e06FAC",
  [ChainId.HARDHAT]: "0x63f84713F52422Af2F8E18b56703b0f80CCcCBcE",
}

export const BTC_SWAP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: "0xC28DF698475dEC994BE00C9C9D8658A548e6304F",
  [ChainId.HARDHAT]: "0x524F04724632eED237cbA3c37272e018b3A7967e",
}

export const VETH2_SWAP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: "0xe37E2a01feA778BC1717d72Bd9f018B6A6B241D5",
  [ChainId.HARDHAT]: "0x8C1f1Ab0b323c4B4FCb9F85CE8beCbCD6F673d43",
}

export const BTC_SWAP_TOKEN = new Token(
  BTC_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddleBTC",
  "saddlebtc",
  "Saddle TBTC/WBTC/RENBTC/SBTC",
  saddleLogo,
)

export const STABLECOIN_SWAP_TOKEN = new Token(
  STABLECOIN_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddleUSD",
  "saddleusd",
  "Saddle DAI/USDC/USDT",
  saddleLogo,
)

export const VETH2_SWAP_TOKEN = new Token(
  VETH2_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddleVETH2",
  "saddleveth2",
  "Saddle WETH/vETH2",
  saddleLogo,
)

// Stablecoins
const DAI_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  [ChainId.HARDHAT]: "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE",
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
  [ChainId.MAINNET]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  [ChainId.HARDHAT]: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
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
  [ChainId.MAINNET]: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  [ChainId.HARDHAT]: "0x59b670e9fA9D0A427751Af201D676719a970857b",
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

// Tokenized BTC
const TBTC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x8daebade922df735c38c80c7ebd708af50815faa",
  [ChainId.HARDHAT]: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
}
export const TBTC = new Token(
  TBTC_CONTRACT_ADDRESSES,
  18,
  "TBTC",
  "tbtc",
  "tBTC",
  tbtcLogo,
)

const WBTC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  [ChainId.HARDHAT]: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
}
export const WBTC = new Token(
  WBTC_CONTRACT_ADDRESSES,
  8,
  "WBTC",
  "wrapped-bitcoin",
  "WBTC",
  wbtcLogo,
)

const RENBTC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d",
  [ChainId.HARDHAT]: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
}
export const RENBTC = new Token(
  RENBTC_CONTRACT_ADDRESSES,
  8,
  "RENBTC",
  "renbtc",
  "renBTC",
  renbtcLogo,
)

const SBTC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6",
  [ChainId.HARDHAT]: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
}
export const SBTC = new Token(
  SBTC_CONTRACT_ADDRESSES,
  18,
  "SBTC",
  "sbtc",
  "sBTC",
  sbtcLogo,
)

export const BTC_POOL_TOKENS = [TBTC, WBTC, RENBTC, SBTC]

const WETH_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  [ChainId.HARDHAT]: "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f",
}
export const WETH = new Token(
  WETH_CONTRACT_ADDRESSES,
  18,
  "WETH",
  "ethereum",
  "WETH",
  wethLogo,
)

const VETH2_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x898BAD2774EB97cF6b94605677F43b41871410B1",
  [ChainId.HARDHAT]: "0x7a2088a1bFc9d81c55368AE168C2C02570cB814F",
}
export const VETH2 = new Token(
  VETH2_CONTRACT_ADDRESSES,
  18,
  "VETH2",
  "ethereum",
  "vETH2",
  veth2Logo,
)

export const VETH2_POOL_TOKENS = [WETH, VETH2]

// maps a symbol string to a token object
export const TOKENS_MAP: {
  [symbol: string]: Token
} = STABLECOIN_POOL_TOKENS.concat(BTC_POOL_TOKENS)
  .concat(VETH2_POOL_TOKENS)
  .reduce((acc, token) => ({ ...acc, [token.symbol]: token }), {})

export const POOLS_MAP: {
  [poolName in PoolName]: {
    lpToken: Token
    poolTokens: Token[]
  }
} = {
  [BTC_POOL_NAME]: {
    lpToken: BTC_SWAP_TOKEN,
    poolTokens: BTC_POOL_TOKENS,
  },
  [STABLECOIN_POOL_NAME]: {
    lpToken: STABLECOIN_SWAP_TOKEN,
    poolTokens: STABLECOIN_POOL_TOKENS,
  },
  [VETH2_POOL_NAME]: {
    lpToken: VETH2_SWAP_TOKEN,
    poolTokens: VETH2_POOL_TOKENS,
  },
}

export const TRANSACTION_TYPES = {
  DEPOSIT: "DEPOSIT",
  WITHDRAW: "WITHDRAW",
  SWAP: "SWAP",
}

export const POOL_FEE_PRECISION = 10

export const DEPLOYED_BLOCK: { [chainId in ChainId]: number } = {
  [ChainId.MAINNET]: 11656944,
  [ChainId.HARDHAT]: 0,
}

export const POOL_STATS_URL: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "https://ipfs.saddle.exchange/pool-stats.json",
  [ChainId.HARDHAT]:
    "https://mehmeta-team-bucket.storage.fleek.co/pool-stats-dev.json",
}

export const SWAP_CONTRACT_GAS_ESTIMATES_MAP = {
  swap: BigNumber.from("200000"), // 157807
  addLiquidity: BigNumber.from("400000"), // 386555
  removeLiquidityImbalance: BigNumber.from("350000"), // 318231
  removeLiquidityOneToken: BigNumber.from("250000"), // 232947
}
