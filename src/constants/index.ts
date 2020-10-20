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

  constructor(
    addresses: { [chainId in ChainId]: string },
    decimals: number,
    symbol: string,
    name: string,
  ) {
    this.addresses = addresses
    this.decimals = decimals
    this.symbol = symbol
    this.name = name
  }
}

export const TEST_STABLECOIN_SWAP_ADDRESS =
  "0x142bFA0788F794d3D0aE1EC36373ee034aABC11f"
export const TEST_BTC_SWAP_ADDRESS =
  "0xC052EC931CdA4aC288BD60c1F8D3E29412976837"

// Stablecoins
const DAI_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  [ChainId.BUIDLER]: "0x54F1df7dB2E46dbeF18CF97A376b79108166fa36",
}
export const DAI = new Token(DAI_CONTRACT_ADDRESSES, 18, "DAI", "Dai")

const USDC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  [ChainId.BUIDLER]: "0xF778f628abF1C0E17618077bAEA4FDA95D334136",
}
export const USDC = new Token(USDC_CONTRACT_ADDRESSES, 6, "USDC", "USDC Coin")

const USDT_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  [ChainId.BUIDLER]: "0xe681Daa8C5aA5029F448592566407df7752B598f",
}
export const USDT = new Token(USDT_CONTRACT_ADDRESSES, 6, "USDT", "Tether")

const SUSD_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x57ab1ec28d129707052df4df418d58a2d46d5f51",
  [ChainId.BUIDLER]: "0x267B07Fd1032e9A4e10dBF2600C8407ee6CA1e8c",
}
export const SUSD = new Token(SUSD_CONTRACT_ADDRESSES, 18, "SUSD", "sUSD")

// Tokenized BTC
const TBTC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x8daebade922df735c38c80c7ebd708af50815faa",
  [ChainId.BUIDLER]: "0x61751f72Fa303F3bB256707dD3cD368c89E82f1b",
}
export const TBTC = new Token(TBTC_CONTRACT_ADDRESSES, 18, "TBTC", "tBTC")

const WBTC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  [ChainId.BUIDLER]: "0x2E10b24b10692fa972510051A1e296D4535043ad",
}
export const WBTC = new Token(
  WBTC_CONTRACT_ADDRESSES,
  8,
  "WBTC",
  "Wrapped Bitcoin",
)

const RENBTC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d",
  [ChainId.BUIDLER]: "0x99245fC7F2d63e1b09EE1b89f0861dcD09e7a4C1",
}
export const RENBTC = new Token(
  RENBTC_CONTRACT_ADDRESSES,
  8,
  "RENBTC",
  "renBTC",
)

const SBTC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6",
  [ChainId.BUIDLER]: "0xdF19a9539Fdd701D8334299C6Dd04931e4022303",
}
export const SBTC = new Token(SBTC_CONTRACT_ADDRESSES, 18, "SBTC", "sBTC")
