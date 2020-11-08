import daiLogo from "../assets/icons/dai.svg"
import renbtcLogo from "../assets/icons/renbtc.svg"
import sbtcLogo from "../assets/icons/sbtc.svg"
import susdLogo from "../assets/icons/susd.svg"
import tbtcLogo from "../assets/icons/tbtc.svg"
import usdcLogo from "../assets/icons/usdc.svg"
import usdtLogo from "../assets/icons/usdt.svg"
import wbtcLogo from "../assets/icons/wbtc.svg"

export const NetworkContextName = "NETWORK"

export enum ChainId {
  MAINNET = 1,
  // ROPSTEN = 3,
  // RINKEBY = 4,
  // GÖRLI = 5,
  // KOVAN = 42,
  BUIDLER = 31337,
}

export class Token {
  addresses: { [chainId in ChainId]: string }
  decimals: number
  symbol: string
  name: string
  icon: string

  constructor(
    addresses: { [chainId in ChainId]: string },
    decimals: number,
    symbol: string,
    name: string,
    icon: string,
  ) {
    this.addresses = addresses
    this.decimals = decimals
    this.symbol = symbol
    this.name = name
    this.icon = icon
  }
}

export const BLOCK_TIME = 15000

export const TEST_STABLECOIN_SWAP_ADDRESS =
  "0x0C6c3C47A1f650809B0D1048FDf9603e09473D7E"
export const TEST_BTC_SWAP_ADDRESS =
  "0x06bA8d8af0dF898D0712DffFb0f862cC51AF45c2"

// Stablecoins
const DAI_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  [ChainId.BUIDLER]: "0x7c2C195CD6D34B8F845992d380aADB2730bB9C6F",
}
export const DAI = new Token(DAI_CONTRACT_ADDRESSES, 18, "DAI", "Dai", daiLogo)

const USDC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  [ChainId.BUIDLER]: "0x8858eeB3DfffA017D4BCE9801D340D36Cf895CCf",
}
export const USDC = new Token(
  USDC_CONTRACT_ADDRESSES,
  6,
  "USDC",
  "USDC Coin",
  usdcLogo,
)

const USDT_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  [ChainId.BUIDLER]: "0x0078371BDeDE8aAc7DeBfFf451B74c5EDB385Af7",
}
export const USDT = new Token(
  USDT_CONTRACT_ADDRESSES,
  6,
  "USDT",
  "Tether",
  usdtLogo,
)

const SUSD_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x57ab1ec28d129707052df4df418d58a2d46d5f51",
  [ChainId.BUIDLER]: "0xf4e77E5Da47AC3125140c470c71cBca77B5c638c",
}
export const SUSD = new Token(
  SUSD_CONTRACT_ADDRESSES,
  18,
  "SUSD",
  "sUSD",
  susdLogo,
)

// Tokenized BTC
const TBTC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x8daebade922df735c38c80c7ebd708af50815faa",
  [ChainId.BUIDLER]: "0xf784709d2317D872237C4bC22f867d1BAe2913AB",
}
export const TBTC = new Token(
  TBTC_CONTRACT_ADDRESSES,
  18,
  "TBTC",
  "tBTC",
  tbtcLogo,
)

const WBTC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  [ChainId.BUIDLER]: "0x3619DbE27d7c1e7E91aA738697Ae7Bc5FC3eACA5",
}
export const WBTC = new Token(
  WBTC_CONTRACT_ADDRESSES,
  8,
  "WBTC",
  "Wrapped Bitcoin",
  wbtcLogo,
)

const RENBTC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d",
  [ChainId.BUIDLER]: "0x038B86d9d8FAFdd0a02ebd1A476432877b0107C8",
}
export const RENBTC = new Token(
  RENBTC_CONTRACT_ADDRESSES,
  8,
  "RENBTC",
  "renBTC",
  renbtcLogo,
)

const SBTC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6",
  [ChainId.BUIDLER]: "0x1A1FEe7EeD918BD762173e4dc5EfDB8a78C924A8",
}
export const SBTC = new Token(
  SBTC_CONTRACT_ADDRESSES,
  18,
  "SBTC",
  "sBTC",
  sbtcLogo,
)
