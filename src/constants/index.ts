import {
  injectedMetaMaskProvider,
  walletconnect,
  walletlink,
} from "../connectors"

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
import mimLogo from "../assets/icons/mim.png"
import nusdLogo from "../assets/icons/nusd.svg"
import renbtcLogo from "../assets/icons/renbtc.svg"
import saddleLPTokenLogo from "../assets/icons/saddle_lp_token.svg"
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
export const SUSD_METAPOOL_NAME = "sUSD Metapool"
export const SUSD_METAPOOL_V2_NAME = "Frax Metapool"
export const TBTC_METAPOOL_NAME = "tBTC Metapool"
export const TBTC_METAPOOL_V2_NAME = "tBTC Metapool V2"
export const WCUSD_METAPOOL_NAME = "wCUSD Metapool"
export const WCUSD_METAPOOL_V2_NAME = "wCUSD Metapool V2"
export const ARB_USD_POOL_NAME = "MIM Pool"
export const FRAX_ARB_USD_POOL_V2_NAME = "Mune USD pool"
export type PoolName =
  | typeof BTC_POOL_NAME
  | typeof BTC_POOL_V2_NAME
  | typeof STABLECOIN_POOL_NAME
  | typeof STABLECOIN_POOL_V2_NAME
  | typeof VETH2_POOL_NAME
  | typeof ALETH_POOL_NAME
  | typeof D4_POOL_NAME
  | typeof SUSD_METAPOOL_NAME
  | typeof SUSD_METAPOOL_V2_NAME
  | typeof TBTC_METAPOOL_NAME
  | typeof TBTC_METAPOOL_V2_NAME
  | typeof WCUSD_METAPOOL_NAME
  | typeof WCUSD_METAPOOL_V2_NAME
  | typeof ARB_USD_POOL_NAME
  | typeof FRAX_ARB_USD_POOL_V2_NAME

export enum ChainId {
  HARDHAT = 31337,
  MATICMUMBAI = 80001,
}
export enum PoolTypes {
  BTC,
  ETH,
  USD,
  OTHER,
}
const buildAddresses = (
  addresses: Partial<Record<ChainId, string>>,
): Record<ChainId, string> => {
  return Object.keys(ChainId).reduce((acc, id) => {
    const numId = Number(id) as ChainId
    return { ...acc, [numId]: addresses?.[numId] || "" }
  }, {}) as Record<ChainId, string>
}
const buildPids = (
  pids: Partial<Record<ChainId, number>>,
): Record<ChainId, number | null> => {
  // @dev be careful to include pid 0 in this boolean logic
  return Object.keys(ChainId).reduce((acc, id) => {
    const numId = Number(id) as ChainId
    const pid = pids[numId]
    return { ...acc, [numId]: pid == null ? null : pid }
  }, {}) as Record<ChainId, number | null>
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

export const SYNTHETIX_CONTRACT_ADDRESSES = buildAddresses({})

export const SYNTHETIX_EXCHANGE_RATES_CONTRACT_ADDRESSES = buildAddresses({})

export const BRIDGE_CONTRACT_ADDRESSES = buildAddresses({})

export const MINICHEF_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.MATICMUMBAI]: "0xCe4A1FD31fAf87d9CB0C85B47F04b064ca6960DF",
})

export const RETROACTIVE_VESTING_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xa0241b781A39FF65Ad5ef786Fb5ABC6119b61D8a",
})

export const SWAP_MIGRATOR_USD_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf",
})

export const GENERALIZED_SWAP_MIGRATOR_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x202CCe504e04bEd6fC0521238dDf04Bc9E8E15aB",
})

export const SUSD_META_SWAP_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x9d4454B023096f34B160D6B654540c56A1F81688",
})

export const SUSD_META_SWAP_V2_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xdbC43Ba45381e02825b14322cDdd15eC4B3164E6",
  [ChainId.MATICMUMBAI]: "0x7263E49AB847Ab4F05457f7ECE71FAD2dE55462E",
})

export const SUSD_META_SWAP_DEPOSIT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x809d550fca64d94Bd9F66E60752A544199cfAC3D",
})

export const SUSD_META_SWAP_V2_DEPOSIT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xf433C50017d963b6082043445bCD0A54716DDC1d",
  [ChainId.MATICMUMBAI]: "0xB5f6c3307192f302d6DCCd8d79b7652454b7d1F2",
})

export const TBTC_META_SWAP_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xA22D78bc37cE77FeE1c44F0C2C0d2524318570c3",
})

export const TBTC_META_SWAP_V2_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x6c8D53600C7f8F97ed32e6162867F3340dE3Ab37",
})

export const TBTC_META_SWAP_DEPOSIT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x0ed2E86FcE2e5A7965f59708c01f88a722BC7f07",
})

export const TBTC_META_SWAP_V2_DEPOSIT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xB06Ce7334A26e90077F0182F07aCF650Bc978936",
})

export const WCUSD_META_SWAP_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x1429859428C0aBc9C2C47C8Ee9FBaf82cFA0F20f",
})

export const WCUSD_META_SWAP_V2_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x8D03623d799E93E53FeDf96aF88e2879bA1804FA",
})

export const WCUSD_META_SWAP_DEPOSIT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x922D6956C99E12DFeB3224DEA977D0939758A1Fe",
})

export const WCUSD_META_SWAP_V2_DEPOSIT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xbc51860c89838ec548d7190657874556407423f4",
})

export const STABLECOIN_SWAP_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x98A0Bc3f9FdAD482CB2e40dE1291f8b0A6FE1860",
})

export const STABLECOIN_SWAP_V2_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xbf9fBFf01664500A33080Da5d437028b07DFcC55",
})

export const BTC_SWAP_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
})

export const BTC_SWAP_V2_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x93b6BDa6a0813D808d75aA42e900664Ceb868bcF",
})

export const VETH2_SWAP_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x6F62d12568c81Dc0fb38426B7Cdba2d265f89B29",
})

export const ALETH_SWAP_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xCafac3dD18aC6c6e92c921884f9E4176737C052c",
})

export const D4_SWAP_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e",
})

export const ARB_USD_SWAP_ADDRESSES = buildAddresses({
  [ChainId.MATICMUMBAI]: "0x2a46634cb2C6428ee235D297d879406b3B39EB23",
})

export const FRAX_ARB_USD_SWAP_V2_ADDRESSES = buildAddresses({
  [ChainId.MATICMUMBAI]: "0x16a676BA365bdab3Fb47D25CC83c5de4De25E3dd",
})

export const RETROACTIVE_SDL_MERKLETREE_DATA = buildAddresses({
  [ChainId.HARDHAT]: "hardhat.json",
})

export const SUSD_SWAP_TOKEN_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xBeaAFDA2E17fC95E69Dc06878039d274E0d2B21A",
})

export const SUSD_SWAP_TOKEN_V2_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xb7c7142Cb2cBf105Eca46A00dDD0Fb3DD7698E8b",
  [ChainId.MATICMUMBAI]: "0xb84480f35932F2edF337Fadc74bD2c03Fe7D594f",
})

export const STABLECOIN_SWAP_TOKEN_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x6D1c89F08bbB35d80B6E6b6d58D2bEFE021eFE8d",
})

export const STABLECOIN_SWAP_V2_TOKEN_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xC863F1F636fddce400E7515eCBDAbbEc4d1E0390",
})

export const WCUSD_SWAP_TOKEN_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x465Df401621060aE6330C13cA7A0baa2B0a9d66D",
})

export const WCUSD_SWAP_TOKEN_V2_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x5c5baB00ef196517c81097dA095948317d458f21",
})

export const ARB_USD_SWAP_TOKEN_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.MATICMUMBAI]: "0xf002D9f706da112B01D2A0CBFD2e0aA61AFd1cDB",
})

export const FRAX_ARB_USD_SWAP_V2_TOKEN_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.MATICMUMBAI]: "0xe822644651422F0a298C5a936088B1e460e4CD69",
})

export const BTC_SWAP_TOKEN_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x6F1216D1BFe15c98520CA1434FC1d9D57AC95321",
})

export const BTC_SWAP_V2_TOKEN_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xbBc1b70e4e04486570bfB621194d4f901a906E8F",
})

export const TBTC_SWAP_TOKEN_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xf76070F44307a4B6649fEC2081cE4B4730c37C76",
})

export const TBTC_SWAP_TOKEN_V2_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x1b1501C45aB5Ee45eE44a2360d53F9eb3316Ab66",
})

export const VETH2_SWAP_TOKEN_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xd44a47B19a7862709588D574f39480f9C4DED1A6",
})

export const ALETH_SWAP_TOKEN_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xAe367415f4BDe0aDEE3e59C35221d259f517413E",
})

export const D4_SWAP_TOKEN_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x2d2c18F63D2144161B38844dCd529124Fbb93cA2",
})

export const SDL_TOKEN_ADDRESSES = buildAddresses({
  [ChainId.MATICMUMBAI]: "0xcfB2523359546D0aFE96F1e59522B973a20925E0",
})

export const SDL_TOKEN = new Token(
  SDL_TOKEN_ADDRESSES,
  18,
  "MUNE",
  "mune-dao", // TBD
  "Mune DAO",
  saddleLogo,
  false,
  false,
)

export const SUSD_SWAP_TOKEN = new Token(
  SUSD_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "muneFRAX",
  "munefrax",
  "Mune FRAX/muneUSD",
  saddleLPTokenLogo,
  false,
  true,
)

export const SUSD_SWAP_V2_TOKEN = new Token(
  SUSD_SWAP_TOKEN_V2_CONTRACT_ADDRESSES,
  18,
  "muneFRAX",
  "munefrax",
  "Mune FRAX/muneUSD",
  saddleLPTokenLogo,
  false,
  true,
)

export const BTC_SWAP_TOKEN = new Token(
  BTC_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddleBTC",
  "saddlebtc",
  "Saddle TBTC/WBTC/RENBTC/SBTC",
  saddleLPTokenLogo,
  false,
  true,
)

export const BTC_SWAP_V2_TOKEN = new Token(
  BTC_SWAP_V2_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddleBTC-V2",
  "saddlebtc-v2",
  "Saddle WBTC/RENBTC/SBTC",
  saddleLPTokenLogo,
  false,
  true,
)

export const TBTC_SWAP_TOKEN = new Token(
  TBTC_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddletBTC",
  "saddletBTC",
  "Saddle tBTCv2/saddleWRenSBTC",
  saddleLPTokenLogo,
  false,
  true,
)

export const TBTC_SWAP_V2_TOKEN = new Token(
  TBTC_SWAP_TOKEN_V2_CONTRACT_ADDRESSES,
  18,
  "saddletBTC-V2",
  "saddletBTC-v2",
  "Saddle tBTCv2/saddleWRenSBTC V2",
  saddleLPTokenLogo,
  false,
  true,
)

export const STABLECOIN_SWAP_TOKEN = new Token(
  STABLECOIN_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddleUSD",
  "saddleusd",
  "Saddle DAI/USDC/USDT",
  saddleLPTokenLogo,
  false,
  true,
)

export const STABLECOIN_SWAP_V2_TOKEN = new Token(
  STABLECOIN_SWAP_V2_TOKEN_CONTRACT_ADDRESSES,
  18,
  "muneUSD-V2",
  "muneusd-v2",
  "DAI/USDC/USDT V2",
  saddleLPTokenLogo,
  false,
  true,
)

export const WCUSD_SWAP_TOKEN = new Token(
  WCUSD_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddlewCUSD",
  "saddlewcusd",
  "Saddle wCUSD/saddleUSD-V2",
  saddleLPTokenLogo,
  false,
  true,
)

export const WCUSD_SWAP_V2_TOKEN = new Token(
  WCUSD_SWAP_TOKEN_V2_CONTRACT_ADDRESSES,
  18,
  "saddlewCUSD-V2",
  "saddlewcusd-v2",
  "Saddle wCUSD/saddleUSD-V2 V2",
  saddleLPTokenLogo,
  false,
  true,
)

export const ARB_USD_SWAP_TOKEN = new Token(
  ARB_USD_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddleArbUSD",
  "saddlearbUSD",
  "Saddle nUSD/MIM/USDC/USDT",
  saddleLPTokenLogo,
  false,
  true,
)

const FRAX_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x851356ae760d987E095750cCeb3bC6014560891C",
  [ChainId.MATICMUMBAI]: "0xBC7d5f9b67fb765812D56b680279831A2c94188F",
})
export const FRAX = new Token(
  FRAX_CONTRACT_ADDRESSES,
  18,
  "FRAX",
  "frax",
  "Frax",
  fraxLogo,
)

export const FRAX_ARB_USD_SWAP_V2_TOKEN = new Token(
  FRAX_ARB_USD_SWAP_V2_TOKEN_CONTRACT_ADDRESSES,
  18,
  "muneUSD",
  "muneusd",
  "Mune DAI/USDC/USDT",
  saddleLPTokenLogo,
  false,
  true,
)

export const VETH2_SWAP_TOKEN = new Token(
  VETH2_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddleVETH2",
  "saddleveth2",
  "Saddle WETH/vETH2",
  saddleLPTokenLogo,
  false,
  true,
)

export const ALETH_SWAP_TOKEN = new Token(
  ALETH_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddleALETH",
  "saddlealeth",
  "Saddle WETH/alETH/sETH",
  saddleLPTokenLogo,
  false,
  true,
)

export const D4_SWAP_TOKEN = new Token(
  D4_SWAP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "saddleD4",
  "saddled4",
  "Saddle alUSD/FEI/FRAX/LUSD",
  saddleLPTokenLogo,
  false,
  true,
)

// Stablecoins
const WCUSD_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xFD471836031dc5108809D173A067e8486B9047A3",
})
export const WCUSD = new Token(
  WCUSD_CONTRACT_ADDRESSES,
  18,
  "wCUSD",
  "wrapped-celo-dollar",
  "Wrapped Celo USD",
  wcusdLogo,
)

const SUSD_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x0E801D84Fa97b50751Dbf25036d067dCf18858bF",
  [ChainId.MATICMUMBAI]: "0x7bc06c482DEAd17c0e297aFbC32f6e63d3846650",
})
export const SUSD = new Token(
  SUSD_CONTRACT_ADDRESSES,
  18,
  "sUSD",
  "nusd",
  "sUSD",
  susdLogo,
  true,
)

const DAI_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
  [ChainId.MATICMUMBAI]: "0x4C7a7Ceb8AAacE3bdfDB351E34C35F4Fc796Ca12",
})
export const DAI = new Token(
  DAI_CONTRACT_ADDRESSES,
  18,
  "DAI",
  "dai",
  "Dai",
  daiLogo,
)

const USDC_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x9A676e781A523b5d0C0e43731313A708CB607508",
  [ChainId.MATICMUMBAI]: "0xd467fB36Bd20A38E186B85C1c326907f48Da2c2B",
})
export const USDC = new Token(
  USDC_CONTRACT_ADDRESSES,
  6,
  "USDC",
  "usd-coin",
  "USDC Coin",
  usdcLogo,
)

const USDT_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1",
  [ChainId.MATICMUMBAI]: "0x3a0a88979e635784cd5CA2C769a30D998907C03b",
})
export const USDT = new Token(
  USDT_CONTRACT_ADDRESSES,
  6,
  "USDT",
  "tether",
  "Tether",
  usdtLogo,
)

const NUSD_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.MATICMUMBAI]: "0x64311c05BB859Fe1e72D0E41b3d63dD39b0aa0Fc",
})
export const NUSD = new Token(
  NUSD_CONTRACT_ADDRESSES,
  18,
  "nUSD",
  "nusd",
  "nUSD",
  nusdLogo,
)

const MIM_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.MATICMUMBAI]: "0x8E46906d5991EF77A41A33a18fB289894C1Ab649",
})
export const MIM = new Token(
  MIM_CONTRACT_ADDRESSES,
  18,
  "MIM",
  "magic-internet-money",
  "Magic Internet Money",
  mimLogo,
)

export const FRAX_ARB_USD_POOL_V2_TOKENS = [DAI, USDC, USDT]
export const STABLECOIN_POOL_TOKENS = [DAI, USDC, USDT]
export const SUSD_POOL_TOKENS = [FRAX, ...FRAX_ARB_USD_POOL_V2_TOKENS]
export const SUSD_UNDERLYING_POOL_TOKENS = [FRAX, FRAX_ARB_USD_SWAP_V2_TOKEN]
export const ARB_USD_POOL_TOKENS = [NUSD, MIM, USDC, USDT]

// Tokenized BTC
const TBTC_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
})
export const TBTC = new Token(
  TBTC_CONTRACT_ADDRESSES,
  18,
  "TBTC",
  "tbtc",
  "tBTC",
  tbtcLogo,
)

const TBTC_V2_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x82e01223d51Eb87e16A03E24687EDF0F294da6f1",
})
export const TBTC_V2 = new Token(
  TBTC_V2_CONTRACT_ADDRESSES,
  18,
  "TBTCv2",
  "tbtc",
  "tBTCv2",
  tbtcLogo,
)

const WBTC_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
})
export const WBTC = new Token(
  WBTC_CONTRACT_ADDRESSES,
  8,
  "WBTC",
  "wrapped-bitcoin",
  "WBTC",
  wbtcLogo,
)

const RENBTC_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
})
export const RENBTC = new Token(
  RENBTC_CONTRACT_ADDRESSES,
  8,
  "RENBTC",
  "renbtc",
  "renBTC",
  renbtcLogo,
)

const SBTC_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
})
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

const WETH_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
})
export const WETH = new Token(
  WETH_CONTRACT_ADDRESSES,
  18,
  "WETH",
  "ethereum",
  "WETH",
  wethLogo,
)

const VETH2_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x59b670e9fA9D0A427751Af201D676719a970857b",
})
export const VETH2 = new Token(
  VETH2_CONTRACT_ADDRESSES,
  18,
  "VETH2",
  "ethereum",
  "vETH2",
  veth2Logo,
)

export const VETH2_POOL_TOKENS = [WETH, VETH2]

const ALETH_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x09635F643e140090A9A8Dcd712eD6285858ceBef",
})
export const ALETH = new Token(
  ALETH_CONTRACT_ADDRESSES,
  18,
  "alETH",
  "alchemix-eth",
  "Alchemix ETH",
  alethLogo,
)

const SETH_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x67d269191c92Caf3cD7723F116c85e6E9bf55933",
})
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

const ALUSD_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB",
})
export const ALUSD = new Token(
  ALUSD_CONTRACT_ADDRESSES,
  18,
  "alUSD",
  "alchemix-usd",
  "Alchemix USD",
  alusdLogo,
)

const FEI_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9",
})
export const FEI = new Token(
  FEI_CONTRACT_ADDRESSES,
  18,
  "FEI",
  "fei-usd",
  "Fei Protocol",
  feiLogo,
)

const LUSD_CONTRACT_ADDRESSES = buildAddresses({
  [ChainId.HARDHAT]: "0x95401dc811bb5740090279Ba06cfA8fcF6113778",
})
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
  metaSwapAddresses?: { [chainId in ChainId]: string }
  underlyingPoolTokens?: Token[]
  underlyingPool?: PoolName
  isOutdated?: boolean // pool can be outdated but not have a migration target
  rewardPids: { [chainId in ChainId]: number | null }
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
    isOutdated: true,
    rewardPids: buildPids({}),
  },
  [BTC_POOL_V2_NAME]: {
    name: BTC_POOL_V2_NAME,
    addresses: BTC_SWAP_V2_ADDRESSES,
    lpToken: BTC_SWAP_V2_TOKEN,
    poolTokens: BTC_POOL_V2_TOKENS,
    isSynthetic: true,
    type: PoolTypes.BTC,
    route: "btcv2",
    rewardPids: buildPids({ [ChainId.HARDHAT]: 4 }),
  },
  [STABLECOIN_POOL_NAME]: {
    name: STABLECOIN_POOL_NAME,
    addresses: STABLECOIN_SWAP_ADDRESSES,
    lpToken: STABLECOIN_SWAP_TOKEN,
    poolTokens: STABLECOIN_POOL_TOKENS,
    isSynthetic: false,
    type: PoolTypes.USD,
    route: "usd",
    rewardPids: buildPids({}),
  },
  [STABLECOIN_POOL_V2_NAME]: {
    name: STABLECOIN_POOL_V2_NAME,
    addresses: STABLECOIN_SWAP_V2_ADDRESSES,
    lpToken: STABLECOIN_SWAP_V2_TOKEN,
    poolTokens: STABLECOIN_POOL_TOKENS,
    isSynthetic: false,
    type: PoolTypes.USD,
    route: "usdv2",
    rewardPids: buildPids({ [ChainId.HARDHAT]: 3 }),
  },
  [VETH2_POOL_NAME]: {
    name: VETH2_POOL_NAME,
    addresses: VETH2_SWAP_ADDRESSES,
    lpToken: VETH2_SWAP_TOKEN,
    poolTokens: VETH2_POOL_TOKENS,
    isSynthetic: false,
    type: PoolTypes.ETH,
    route: "veth2",
    rewardPids: buildPids({}),
  },
  [ALETH_POOL_NAME]: {
    name: ALETH_POOL_NAME,
    addresses: ALETH_SWAP_ADDRESSES,
    lpToken: ALETH_SWAP_TOKEN,
    poolTokens: ALETH_POOL_TOKENS,
    isSynthetic: true,
    type: PoolTypes.ETH,
    route: "aleth",
    rewardPids: buildPids({ [ChainId.HARDHAT]: 1 }),
  },
  [D4_POOL_NAME]: {
    name: D4_POOL_NAME,
    addresses: D4_SWAP_ADDRESSES,
    lpToken: D4_SWAP_TOKEN,
    poolTokens: D4_POOL_TOKENS,
    isSynthetic: false,
    type: PoolTypes.USD,
    route: "d4",
    rewardPids: buildPids({ [ChainId.HARDHAT]: 2 }),
  },
  [ARB_USD_POOL_NAME]: {
    name: ARB_USD_POOL_NAME,
    addresses: ARB_USD_SWAP_ADDRESSES,
    lpToken: ARB_USD_SWAP_TOKEN,
    poolTokens: ARB_USD_POOL_TOKENS,
    isSynthetic: false,
    type: PoolTypes.USD,
    route: "arbusd",
    isOutdated: true,
    rewardPids: buildPids({ [ChainId.MATICMUMBAI]: 1 }),
  },
  [FRAX_ARB_USD_POOL_V2_NAME]: {
    name: FRAX_ARB_USD_POOL_V2_NAME,
    addresses: FRAX_ARB_USD_SWAP_V2_ADDRESSES,
    lpToken: FRAX_ARB_USD_SWAP_V2_TOKEN,
    poolTokens: FRAX_ARB_USD_POOL_V2_TOKENS,
    isSynthetic: false,
    type: PoolTypes.USD,
    route: "muneusd",
    rewardPids: buildPids({ [ChainId.MATICMUMBAI]: 2 }),
  },
  [SUSD_METAPOOL_V2_NAME]: {
    name: SUSD_METAPOOL_V2_NAME,
    lpToken: SUSD_SWAP_V2_TOKEN,
    poolTokens: SUSD_POOL_TOKENS,
    addresses: SUSD_META_SWAP_V2_DEPOSIT_ADDRESSES,
    isSynthetic: false,
    type: PoolTypes.USD,
    metaSwapAddresses: SUSD_META_SWAP_V2_ADDRESSES,
    underlyingPoolTokens: SUSD_UNDERLYING_POOL_TOKENS,
    underlyingPool: STABLECOIN_POOL_V2_NAME,
    route: "munefrax",
    rewardPids: buildPids({ [ChainId.MATICMUMBAI]: 3 }),
  },
  [SUSD_METAPOOL_NAME]: {
    name: SUSD_METAPOOL_NAME,
    lpToken: SUSD_SWAP_TOKEN,
    poolTokens: SUSD_POOL_TOKENS,
    addresses: SUSD_META_SWAP_DEPOSIT_ADDRESSES,
    isSynthetic: true,
    type: PoolTypes.USD,
    metaSwapAddresses: SUSD_META_SWAP_ADDRESSES,
    underlyingPoolTokens: SUSD_UNDERLYING_POOL_TOKENS,
    underlyingPool: STABLECOIN_POOL_V2_NAME,
    route: "susd",
    rewardPids: buildPids({}),
  },
  [TBTC_METAPOOL_NAME]: {
    name: TBTC_METAPOOL_NAME,
    lpToken: TBTC_SWAP_TOKEN,
    poolTokens: TBTC_POOL_TOKENS,
    addresses: TBTC_META_SWAP_DEPOSIT_ADDRESSES,
    isSynthetic: true,
    type: PoolTypes.BTC,
    metaSwapAddresses: TBTC_META_SWAP_ADDRESSES,
    underlyingPoolTokens: TBTC_UNDERLYING_POOL_TOKENS,
    underlyingPool: BTC_POOL_V2_NAME,
    route: "tbtc",
    rewardPids: buildPids({}),
  },
  [TBTC_METAPOOL_V2_NAME]: {
    name: TBTC_METAPOOL_V2_NAME,
    lpToken: TBTC_SWAP_V2_TOKEN,
    poolTokens: TBTC_POOL_TOKENS,
    addresses: TBTC_META_SWAP_V2_DEPOSIT_ADDRESSES,
    isSynthetic: true,
    type: PoolTypes.BTC,
    metaSwapAddresses: TBTC_META_SWAP_V2_ADDRESSES,
    underlyingPoolTokens: TBTC_UNDERLYING_POOL_TOKENS,
    underlyingPool: BTC_POOL_V2_NAME,
    route: "tbtcv2",
    rewardPids: buildPids({}),
  },
  [WCUSD_METAPOOL_NAME]: {
    name: WCUSD_METAPOOL_NAME,
    lpToken: WCUSD_SWAP_TOKEN,
    poolTokens: WCUSD_POOL_TOKENS,
    addresses: WCUSD_META_SWAP_DEPOSIT_ADDRESSES,
    isSynthetic: false,
    type: PoolTypes.USD,
    metaSwapAddresses: WCUSD_META_SWAP_ADDRESSES,
    underlyingPoolTokens: WCUSD_UNDERLYING_POOL_TOKENS,
    underlyingPool: STABLECOIN_POOL_V2_NAME,
    route: "wcusd",
    rewardPids: buildPids({}),
  },
  [WCUSD_METAPOOL_V2_NAME]: {
    name: WCUSD_METAPOOL_V2_NAME,
    lpToken: WCUSD_SWAP_V2_TOKEN,
    poolTokens: WCUSD_POOL_TOKENS,
    addresses: WCUSD_META_SWAP_V2_DEPOSIT_ADDRESSES,
    isSynthetic: false,
    type: PoolTypes.USD,
    metaSwapAddresses: WCUSD_META_SWAP_V2_ADDRESSES,
    underlyingPoolTokens: WCUSD_UNDERLYING_POOL_TOKENS,
    underlyingPool: STABLECOIN_POOL_V2_NAME,
    route: "wcusdv2",
    rewardPids: buildPids({}),
  },
}
export function isLegacySwapABIPool(poolName: string): boolean {
  return new Set([BTC_POOL_NAME, STABLECOIN_POOL_NAME, VETH2_POOL_NAME]).has(
    poolName,
  )
}
export function isMetaPool(poolName = ""): boolean {
  return new Set([
    SUSD_METAPOOL_NAME,
    SUSD_METAPOOL_V2_NAME,
    TBTC_METAPOOL_NAME,
    TBTC_METAPOOL_V2_NAME,
    WCUSD_METAPOOL_NAME,
    WCUSD_METAPOOL_V2_NAME,
  ]).has(poolName)
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

export type LPTokenToPoolsMap = {
  [tokenSymbol: string]: PoolName
}
export const LPTOKEN_TO_POOL_MAP = Object.keys(POOLS_MAP).reduce(
  (acc, poolName) => {
    const pool = POOLS_MAP[poolName as PoolName]
    const newAcc = { ...acc }
    newAcc[pool.lpToken.symbol] = poolName as PoolName
    return newAcc
  },
  {} as LPTokenToPoolsMap,
)

export const TRANSACTION_TYPES = {
  DEPOSIT: "DEPOSIT",
  WITHDRAW: "WITHDRAW",
  SWAP: "SWAP",
  MIGRATE: "MIGRATE",
  STAKE_OR_CLAIM: "STAKE_OR_CLAIM",
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
    connector: injectedMetaMaskProvider,
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
export const IS_VIRTUAL_SWAP_ACTIVE = true
export const IS_L2_SUPPORTED = true
export const IS_SDL_LIVE = true
// FLAGS END
