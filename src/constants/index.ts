import { injected, walletconnect, walletlink } from "../connectors"

import { AbstractConnector } from "@web3-react/abstract-connector"
import { BigNumber } from "@ethersproject/bignumber"
import alethLogo from "../assets/icons/aleth.svg"
import alusdLogo from "../assets/icons/alusd.svg"
import coinbasewalletIcon from "../assets/icons/coinbasewallet.svg"
import daiLogo from "../assets/icons/dai.svg"
import feiLogo from "../assets/icons/fei.svg"
import fraxLogo from "../assets/icons/frax.svg"
import lusdLogo from "../assets/icons/lusd.svg"
import metamaskIcon from "../assets/icons/metamask.svg"
import renbtcLogo from "../assets/icons/renbtc.svg"
import saddleLogo from "../assets/icons/logo_24.svg"
import sbtcLogo from "../assets/icons/sbtc.svg"
import sethLogo from "../assets/icons/seth.svg"
import susdLogo from "../assets/icons/susd.svg"
import tbtcLogo from "../assets/icons/tbtc.svg"
import usdcLogo from "../assets/icons/usdc.svg"
import usdtLogo from "../assets/icons/usdt.svg"
import veth2Logo from "../assets/icons/veth2.svg"
import walletconnectIcon from "../assets/icons/walletconnect.svg"
import wbtcLogo from "../assets/icons/wbtc.svg"
import wcusdLogo from "../assets/icons/wcusd.png"
import wethLogo from "../assets/icons/weth.svg"

export const NetworkContextName = "NETWORK"
export const BTC_POOL_NAME = "BTC Pool"
export const BTC_POOL_V2_NAME = "BTC Pool V2"
export const STABLECOIN_POOL_NAME = "Stablecoin Pool"
export const STABLECOIN_POOL_V2_NAME = "Stablecoin Pool V2"
export const VETH2_POOL_NAME = "vETH2 Pool"
export const ALETH_POOL_NAME = "alETH Pool"
export const D4_POOL_NAME = "D4 Pool"
export const SUSD_POOL_NAME = "sUSD Pool"
export const TBTC_POOL_NAME = "tBTC Pool"
export const WCUSD_POOL_NAME = "wCUSD Pool"
export type PoolName =
  | typeof BTC_POOL_NAME
  | typeof BTC_POOL_V2_NAME
  | typeof STABLECOIN_POOL_NAME
  | typeof STABLECOIN_POOL_V2_NAME
  | typeof VETH2_POOL_NAME
  | typeof ALETH_POOL_NAME
  | typeof D4_POOL_NAME
  | typeof SUSD_POOL_NAME
  | typeof TBTC_POOL_NAME
  | typeof WCUSD_POOL_NAME

export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  // RINKEBY = 4,
  // GÖRLI = 5,
  // KOVAN = 42,
  HARDHAT = 31337,
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

export const SYNTHETIX_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "",
}

export const SYNTHETIX_EXCHANGE_RATES_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: "0xd69b189020EF614796578AfE4d10378c5e7e1138",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "",
}

export const BRIDGE_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xa5bD85ed9fA27ba23BfB702989e7218E44fd4706",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "",
}

export const SWAP_MIGRATOR_USD_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: "0x9cDeF6e33687F438808766fC133b2E9d1A16AD57",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf",
}

export const SUSD_META_SWAP_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x0C8BAe14c9f9BF2c953997C881BEfaC7729FD314",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "0x9d4454B023096f34B160D6B654540c56A1F81688",
}

export const SUSD_META_SWAP_DEPOSIT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: "0x1e35ebF875f8A2185EDf22da02e7dBCa0F5558aB",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "0x809d550fca64d94Bd9F66E60752A544199cfAC3D",
}

export const TBTC_META_SWAP_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xf74ebe6e5586275dc4CeD78F5DBEF31B1EfbE7a5",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "0xA22D78bc37cE77FeE1c44F0C2C0d2524318570c3",
}

export const TBTC_META_SWAP_DEPOSIT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: "0xee1ec4e1C6e39C31dAaf3db2A62A397bdf3fe2f1",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "0x0ed2E86FcE2e5A7965f59708c01f88a722BC7f07",
}

export const WCUSD_META_SWAP_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x3F1d224557afA4365155ea77cE4BC32D5Dae2174",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "0x1429859428C0aBc9C2C47C8Ee9FBaf82cFA0F20f",
}

export const WCUSD_META_SWAP_DEPOSIT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: "0x401AFbc31ad2A3Bc0eD8960d63eFcDEA749b4849",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "0x922D6956C99E12DFeB3224DEA977D0939758A1Fe",
}

export const STABLECOIN_SWAP_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x3911F80530595fBd01Ab1516Ab61255d75AEb066",
  [ChainId.ROPSTEN]: "0xbCED0cB1e8022869678d40b3c71FA7A443CA8090",
  [ChainId.HARDHAT]: "0x98A0Bc3f9FdAD482CB2e40dE1291f8b0A6FE1860",
}

export const STABLECOIN_SWAP_V2_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xaCb83E0633d6605c5001e2Ab59EF3C745547C8C7",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "0xbf9fBFf01664500A33080Da5d437028b07DFcC55",
}

export const BTC_SWAP_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x4f6A43Ad7cba042606dECaCA730d4CE0A57ac62e",
  [ChainId.ROPSTEN]: "0x02ad8Da8cCa3764DFb62d749E51Cb3d4b35643ad",
  [ChainId.HARDHAT]: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
}

export const BTC_SWAP_V2_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xdf3309771d2BF82cb2B6C56F9f5365C8bD97c4f2",
  [ChainId.ROPSTEN]: "", // TODO: add address after deployment
  [ChainId.HARDHAT]: "0x93b6BDa6a0813D808d75aA42e900664Ceb868bcF",
}

export const VETH2_SWAP_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xdec2157831D6ABC3Ec328291119cc91B337272b5",
  [ChainId.ROPSTEN]: "0x2C019509326485AE234c6CA8a51c9F4A0F94f5fA",
  [ChainId.HARDHAT]: "0x6F62d12568c81Dc0fb38426B7Cdba2d265f89B29",
}

export const ALETH_SWAP_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xa6018520EAACC06C30fF2e1B3ee2c7c22e64196a",
  [ChainId.ROPSTEN]: "0x53434526fCB7a5FF358AB74C13C1c582BBE6Ab9e",
  [ChainId.HARDHAT]: "0xCafac3dD18aC6c6e92c921884f9E4176737C052c",
}

export const D4_SWAP_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xC69DDcd4DFeF25D8a793241834d4cc4b3668EAD6",
  [ChainId.ROPSTEN]: "0xa5da0cB57830011c67Cb89e73582e7Bf0f49f81e",
  [ChainId.HARDHAT]: "0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e",
}

export const MERKLETREE_DATA: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "mainnetTestAccounts.json",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "hardhat.json",
}

export const SUSD_SWAP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: "0x8Fa31c1b33De16bf05c38AF20329f22D544aD64c",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "0xBeaAFDA2E17fC95E69Dc06878039d274E0d2B21A",
}

export const STABLECOIN_SWAP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: "0x76204f8CFE8B95191A3d1CfA59E267EA65e06FAC",
  [ChainId.ROPSTEN]: "0x09f0e9d602c9989B2C03983cA37E7fa18084C44B",
  [ChainId.HARDHAT]: "0x6D1c89F08bbB35d80B6E6b6d58D2bEFE021eFE8d",
}

export const STABLECOIN_SWAP_V2_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: "0x5f86558387293b6009d7896A61fcc86C17808D62",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "0xC863F1F636fddce400E7515eCBDAbbEc4d1E0390",
}

export const WCUSD_SWAP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: "0x78179d49C13c4ECa14C69545ec172Ba0179EAE6B",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "0x465Df401621060aE6330C13cA7A0baa2B0a9d66D",
}

export const BTC_SWAP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: "0xC28DF698475dEC994BE00C9C9D8658A548e6304F",
  [ChainId.ROPSTEN]: "0x7546eC9bf608162117D9Ac6A3F7D50aaE9ea9E6B",
  [ChainId.HARDHAT]: "0x6F1216D1BFe15c98520CA1434FC1d9D57AC95321",
}

export const BTC_SWAP_V2_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: "0xF32E91464ca18fc156aB97a697D6f8ae66Cd21a3",
  [ChainId.ROPSTEN]: "", // TODO: add address after deployment
  [ChainId.HARDHAT]: "0xbBc1b70e4e04486570bfB621194d4f901a906E8F",
}

export const TBTC_SWAP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: "0x122Eca07139EB368245A29FB702c9ff11E9693B7",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "0xf76070F44307a4B6649fEC2081cE4B4730c37C76",
}

export const VETH2_SWAP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: "0xe37E2a01feA778BC1717d72Bd9f018B6A6B241D5",
  [ChainId.ROPSTEN]: "0x28B465383ab829adFf02794917cD2FB8d04b0902",
  [ChainId.HARDHAT]: "0xd44a47B19a7862709588D574f39480f9C4DED1A6",
}

export const ALETH_SWAP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: "0xc9da65931ABf0Ed1b74Ce5ad8c041C4220940368",
  [ChainId.ROPSTEN]: "0x13e0d50308C01cf5BdA4b64CcBCceF0C6B9710DF",
  [ChainId.HARDHAT]: "0xAe367415f4BDe0aDEE3e59C35221d259f517413E",
}

export const D4_SWAP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: "0xd48cF4D7FB0824CC8bAe055dF3092584d0a1726A",
  [ChainId.ROPSTEN]: "0xA2b37a2c1F5E523f867137D2394Da1AC2283f473",
  [ChainId.HARDHAT]: "0x2d2c18F63D2144161B38844dCd529124Fbb93cA2",
}

export const SUSD_SWAP_TOKEN = new Token(
  SUSD_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddleSUSD",
  "saddlesusd",
  "Saddle sUSD/saddleUSD-V2",
  saddleLogo,
  false,
  true,
)

export const BTC_SWAP_TOKEN = new Token(
  BTC_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddleBTC",
  "saddlebtc",
  "Saddle TBTC/WBTC/RENBTC/SBTC",
  saddleLogo,
  false,
  true,
)

export const BTC_SWAP_V2_TOKEN = new Token(
  BTC_SWAP_V2_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddleBTC-V2",
  "saddlebtc-v2",
  "Saddle WBTC/RENBTC/SBTC",
  saddleLogo,
  false,
  true,
)

export const TBTC_SWAP_TOKEN = new Token(
  TBTC_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddletBTC",
  "saddletBTC",
  "Saddle tBTCv2/saddleWRenSBTC",
  saddleLogo,
  false,
  true,
)

export const STABLECOIN_SWAP_TOKEN = new Token(
  STABLECOIN_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddleUSD",
  "saddleusd",
  "Saddle DAI/USDC/USDT",
  saddleLogo,
  false,
  true,
)

export const STABLECOIN_SWAP_V2_TOKEN = new Token(
  STABLECOIN_SWAP_V2_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddleUSD-V2",
  "saddleusd-v2",
  "Saddle DAI/USDC/USDT V2",
  saddleLogo,
  false,
  true,
)

export const WCUSD_SWAP_TOKEN = new Token(
  WCUSD_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddlewCUSD",
  "saddlewcusd",
  "Saddle wCUSD/saddleUSD-V2",
  saddleLogo,
  false,
  true,
)

export const VETH2_SWAP_TOKEN = new Token(
  VETH2_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddleVETH2",
  "saddleveth2",
  "Saddle WETH/vETH2",
  saddleLogo,
  false,
  true,
)

export const ALETH_SWAP_TOKEN = new Token(
  ALETH_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddleALETH",
  "saddlealeth",
  "Saddle WETH/alETH/sETH",
  saddleLogo,
  false,
  true,
)

export const D4_SWAP_TOKEN = new Token(
  D4_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddleD4",
  "saddled4",
  "Saddle alUSD/FEI/FRAX/LUSD",
  saddleLogo,
  false,
  true,
)

// Stablecoins
const WCUSD_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xad3e3fc59dff318beceaab7d00eb4f68b1ecf195",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "0xFD471836031dc5108809D173A067e8486B9047A3",
}
export const WCUSD = new Token(
  WCUSD_CONTRACT_ADDRESSES,
  18,
  "wCUSD",
  "wrapped-celo-dollar",
  "Wrapped Celo USD",
  wcusdLogo,
)

const SUSD_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "0x0E801D84Fa97b50751Dbf25036d067dCf18858bF",
}
export const SUSD = new Token(
  SUSD_CONTRACT_ADDRESSES,
  18,
  "sUSD",
  "nusd",
  "sUSD",
  susdLogo,
  true,
)

const DAI_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  [ChainId.ROPSTEN]: "0x8C924e41d0624Ae6E7DB09fc93BBfB324c31BE0C",
  [ChainId.HARDHAT]: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
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
  [ChainId.ROPSTEN]: "0xA4fe4981f7550884E7E6224F0c78245DC145b2F2",
  [ChainId.HARDHAT]: "0x9A676e781A523b5d0C0e43731313A708CB607508",
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
  [ChainId.ROPSTEN]: "0x0593d1b92e8Ba6bBC428923245891efF0311Fa15",
  [ChainId.HARDHAT]: "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1",
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
export const SUSD_POOL_TOKENS = [SUSD, ...STABLECOIN_POOL_TOKENS]
export const SUSD_UNDERLYING_POOL_TOKENS = [SUSD, STABLECOIN_SWAP_V2_TOKEN]

// Tokenized BTC
const TBTC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x8daebade922df735c38c80c7ebd708af50815faa",
  [ChainId.ROPSTEN]: "0x9F6aA48f852Dd928F53A7dd3dcd2AC96a76c8727",
  [ChainId.HARDHAT]: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
}
export const TBTC = new Token(
  TBTC_CONTRACT_ADDRESSES,
  18,
  "TBTC",
  "tbtc",
  "tBTC",
  tbtcLogo,
)

const TBTC_V2_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x18084fba666a33d37592fa2633fd49a74dd93a88",
  [ChainId.ROPSTEN]: "",
  [ChainId.HARDHAT]: "0x82e01223d51Eb87e16A03E24687EDF0F294da6f1",
}
export const TBTC_V2 = new Token(
  TBTC_V2_CONTRACT_ADDRESSES,
  18,
  "TBTCv2",
  "tbtc",
  "tBTCv2",
  tbtcLogo,
)

const WBTC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  [ChainId.ROPSTEN]: "0x7264594dFB80a150f80b2988862605dDfda53727",
  [ChainId.HARDHAT]: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
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
  [ChainId.ROPSTEN]: "0x79B92D075d72d639D46D30CE15e6DdDE50ad5890",
  [ChainId.HARDHAT]: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
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
  [ChainId.ROPSTEN]: "0xAc2931cFA6ff57Aaf64B43DFdc5190ca3c341640",
  [ChainId.HARDHAT]: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
}
export const SBTC = new Token(
  SBTC_CONTRACT_ADDRESSES,
  18,
  "sBTC",
  "sbtc",
  "sBTC",
  sbtcLogo,
  true,
)

export const BTC_POOL_TOKENS = [TBTC, WBTC, RENBTC, SBTC]
export const BTC_POOL_V2_TOKENS = [WBTC, RENBTC, SBTC]

export const TBTC_POOL_TOKENS = [TBTC_V2, ...BTC_POOL_V2_TOKENS]
export const TBTC_UNDERLYING_POOL_TOKENS = [TBTC_V2, BTC_SWAP_V2_TOKEN]

const WETH_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  [ChainId.ROPSTEN]: "0x0B68F3b6c7fc0b6dD4D9a2399C4AE35be060ba42",
  [ChainId.HARDHAT]: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
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
  [ChainId.ROPSTEN]: "0xd46Ea72ABf55699b17eAF529c6533e5c13F5E687",
  [ChainId.HARDHAT]: "0x59b670e9fA9D0A427751Af201D676719a970857b",
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

const ALETH_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6",
  [ChainId.ROPSTEN]: "0xaA91d3f2C53BDBEdd45FaB0308d0b51315Dc32E7",
  [ChainId.HARDHAT]: "0x09635F643e140090A9A8Dcd712eD6285858ceBef",
}
export const ALETH = new Token(
  ALETH_CONTRACT_ADDRESSES,
  18,
  "alETH",
  "alchemix-eth",
  "Alchemix ETH",
  alethLogo,
)

const SETH_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x5e74C9036fb86BD7eCdcb084a0673EFc32eA31cb",
  [ChainId.ROPSTEN]: "0x82BD6d2A185ed1C48e01830853fEf7f4D02fF1cC",
  [ChainId.HARDHAT]: "0x67d269191c92Caf3cD7723F116c85e6E9bf55933",
}
export const SETH = new Token(
  SETH_CONTRACT_ADDRESSES,
  18,
  "sETH",
  "seth",
  "Synth sETH",
  sethLogo,
  true,
)

export const ALETH_POOL_TOKENS = [WETH, ALETH, SETH]

const ALUSD_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9",
  [ChainId.ROPSTEN]: "0x8b7a92FdbC77c6d8c61644D118c37D813B2069C4",
  [ChainId.HARDHAT]: "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB",
}
export const ALUSD = new Token(
  ALUSD_CONTRACT_ADDRESSES,
  18,
  "alUSD",
  "alchemix-usd",
  "Alchemix USD",
  alusdLogo,
)

const FEI_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x956F47F50A910163D8BF957Cf5846D573E7f87CA",
  [ChainId.ROPSTEN]: "0x02020a3006587080a00d6675AFfACC99344521AC",
  [ChainId.HARDHAT]: "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9",
}
export const FEI = new Token(
  FEI_CONTRACT_ADDRESSES,
  18,
  "FEI",
  "fei-protocol",
  "Fei Protocol",
  feiLogo,
)

const FRAX_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x853d955aCEf822Db058eb8505911ED77F175b99e",
  [ChainId.ROPSTEN]: "0xb295E36469C8Aef7d76b661aD5af02cdB258D662",
  [ChainId.HARDHAT]: "0x851356ae760d987E095750cCeb3bC6014560891C",
}
export const FRAX = new Token(
  FRAX_CONTRACT_ADDRESSES,
  18,
  "FRAX",
  "frax",
  "Frax",
  fraxLogo,
)

const LUSD_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
  [ChainId.ROPSTEN]: "0x440d96e36f1A087deFdB5206b5e53DD2e526840B",
  [ChainId.HARDHAT]: "0x95401dc811bb5740090279Ba06cfA8fcF6113778",
}
export const LUSD = new Token(
  LUSD_CONTRACT_ADDRESSES,
  18,
  "LUSD",
  "liquity-usd",
  "Liquity USD",
  lusdLogo,
)

export const D4_POOL_TOKENS = [ALUSD, FEI, FRAX, LUSD]

export const WCUSD_POOL_TOKENS = [WCUSD, ...STABLECOIN_POOL_TOKENS]
export const WCUSD_UNDERLYING_POOL_TOKENS = [WCUSD, STABLECOIN_SWAP_V2_TOKEN]

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
  [BTC_POOL_NAME]: {
    name: BTC_POOL_NAME,
    addresses: BTC_SWAP_ADDRESSES,
    lpToken: BTC_SWAP_TOKEN,
    poolTokens: BTC_POOL_TOKENS,
    isSynthetic: true,
    type: PoolTypes.BTC,
    route: "btc",
  },
  [BTC_POOL_V2_NAME]: {
    name: BTC_POOL_V2_NAME,
    addresses: BTC_SWAP_V2_ADDRESSES,
    lpToken: BTC_SWAP_V2_TOKEN,
    poolTokens: BTC_POOL_V2_TOKENS,
    isSynthetic: true,
    type: PoolTypes.BTC,
    route: "btcv2",
  },
  [STABLECOIN_POOL_NAME]: {
    name: STABLECOIN_POOL_NAME,
    addresses: STABLECOIN_SWAP_ADDRESSES,
    lpToken: STABLECOIN_SWAP_TOKEN,
    poolTokens: STABLECOIN_POOL_TOKENS,
    isSynthetic: false,
    type: PoolTypes.USD,
    migration: STABLECOIN_POOL_V2_NAME,
    route: "usd",
  },
  [STABLECOIN_POOL_V2_NAME]: {
    name: STABLECOIN_POOL_V2_NAME,
    addresses: STABLECOIN_SWAP_V2_ADDRESSES,
    lpToken: STABLECOIN_SWAP_V2_TOKEN,
    poolTokens: STABLECOIN_POOL_TOKENS,
    isSynthetic: false,
    type: PoolTypes.USD,
    route: "usdv2",
  },
  [VETH2_POOL_NAME]: {
    name: VETH2_POOL_NAME,
    addresses: VETH2_SWAP_ADDRESSES,
    lpToken: VETH2_SWAP_TOKEN,
    poolTokens: VETH2_POOL_TOKENS,
    isSynthetic: false,
    type: PoolTypes.ETH,
    route: "veth2",
  },
  [ALETH_POOL_NAME]: {
    name: ALETH_POOL_NAME,
    addresses: ALETH_SWAP_ADDRESSES,
    lpToken: ALETH_SWAP_TOKEN,
    poolTokens: ALETH_POOL_TOKENS,
    isSynthetic: true,
    type: PoolTypes.ETH,
    route: "aleth",
  },
  [D4_POOL_NAME]: {
    name: D4_POOL_NAME,
    addresses: D4_SWAP_ADDRESSES,
    lpToken: D4_SWAP_TOKEN,
    poolTokens: D4_POOL_TOKENS,
    isSynthetic: false,
    type: PoolTypes.USD,
    route: "d4",
  },
  [SUSD_POOL_NAME]: {
    name: SUSD_POOL_NAME,
    lpToken: SUSD_SWAP_TOKEN,
    poolTokens: SUSD_POOL_TOKENS,
    addresses: SUSD_META_SWAP_DEPOSIT_ADDRESSES,
    isSynthetic: true,
    type: PoolTypes.USD,
    metaSwapAddresses: SUSD_META_SWAP_ADDRESSES,
    underlyingPoolTokens: SUSD_UNDERLYING_POOL_TOKENS,
    route: "susd",
  },
  [TBTC_POOL_NAME]: {
    name: TBTC_POOL_NAME,
    lpToken: TBTC_SWAP_TOKEN,
    poolTokens: TBTC_POOL_TOKENS,
    addresses: TBTC_META_SWAP_DEPOSIT_ADDRESSES,
    isSynthetic: true,
    type: PoolTypes.BTC,
    metaSwapAddresses: TBTC_META_SWAP_ADDRESSES,
    underlyingPoolTokens: TBTC_UNDERLYING_POOL_TOKENS,
    route: "tbtc",
  },
  [WCUSD_POOL_NAME]: {
    name: WCUSD_POOL_NAME,
    lpToken: WCUSD_SWAP_TOKEN,
    poolTokens: WCUSD_POOL_TOKENS,
    addresses: WCUSD_META_SWAP_DEPOSIT_ADDRESSES,
    isSynthetic: false,
    type: PoolTypes.USD,
    metaSwapAddresses: WCUSD_META_SWAP_ADDRESSES,
    underlyingPoolTokens: WCUSD_UNDERLYING_POOL_TOKENS,
    route: "wcusd",
  },
}
export function isLegacySwapABIPool(poolName: string): boolean {
  return new Set([BTC_POOL_NAME, STABLECOIN_POOL_NAME, VETH2_POOL_NAME]).has(
    poolName,
  )
}
export function isMetaPool(poolName = ""): boolean {
  return new Set([SUSD_POOL_NAME, TBTC_POOL_NAME, WCUSD_POOL_NAME]).has(
    poolName,
  )
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
  [SWAP_TYPES.SYNTH_TO_SYNTH]: BigNumber.from("700000"), // 681,128 // TODO: https://github.com/saddle-finance/saddle-frontend/issues/471
  addLiquidity: BigNumber.from("400000"), // 386,555
  removeLiquidityImbalance: BigNumber.from("350000"), // 318,231
  removeLiquidityOneToken: BigNumber.from("250000"), // 232,947
  migrate: BigNumber.from("650000"), // 619,126
  virtualSwapSettleOrWithdraw: BigNumber.from("400000"),
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

// "SADDLE" in bytes32 form
export const SYNTH_TRACKING_ID =
  "0x534144444c450000000000000000000000000000000000000000000000000000"

// FLAGS
export const IS_VIRTUAL_SWAP_ACTIVE = false
// FLAGS END
