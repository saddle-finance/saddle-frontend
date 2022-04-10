import { ComponentMeta, ComponentStory } from "@storybook/react"
import { BigNumber } from "ethers"
import React from "react"
import { SWAP_TYPES } from "../constants"
import SwapTokenInput from "../components/SwapTokenInput"
import { TokenOption } from "../pages/Swap"

export default {
  title: "Light components/SwapTokenInput",
  component: SwapTokenInput,
} as ComponentMeta<typeof SwapTokenInput>

const Template: ComponentStory<typeof SwapTokenInput> = (args) => (
  <SwapTokenInput {...args} />
)

const tokenOptionLists: TokenOption[] = [
  {
    name: "sBTC",
    symbol: "sBTC",
    decimals: 18,
    amount: BigNumber.from("81234500000000"),
    valueUSD: BigNumber.from("0x00"),
    swapType: SWAP_TYPES.DIRECT,
    isAvailable: true,
  },
  {
    name: "renBTC",
    symbol: "RENBTC",
    decimals: 8,
    amount: BigNumber.from("0x00"),
    valueUSD: BigNumber.from("0x00"),
    swapType: SWAP_TYPES.DIRECT,
    isAvailable: true,
  },
  {
    name: "WBTC",
    symbol: "WBTC",
    decimals: 8,
    amount: BigNumber.from("0x00"),
    valueUSD: BigNumber.from("0x00"),
    swapType: SWAP_TYPES.DIRECT,
    isAvailable: true,
  },
  {
    name: "Dai",
    symbol: "DAI",
    decimals: 18,
    amount: BigNumber.from("0x00"),
    valueUSD: BigNumber.from("0x00"),
    swapType: SWAP_TYPES.DIRECT,
    isAvailable: true,
  },
  {
    name: "USDC Coin",
    symbol: "USDC",
    decimals: 6,
    amount: BigNumber.from("912345"),
    valueUSD: BigNumber.from("0x42"),
    swapType: SWAP_TYPES.DIRECT,
    isAvailable: true,
  },
  {
    name: "Tether",
    symbol: "USDT",
    decimals: 6,
    amount: BigNumber.from("0x00"),
    valueUSD: BigNumber.from("0x00"),
    swapType: SWAP_TYPES.DIRECT,
    isAvailable: true,
  },
  {
    name: "WETH",
    symbol: "WETH",
    decimals: 18,
    amount: BigNumber.from("0x00"),
    valueUSD: BigNumber.from("0x00"),
    swapType: SWAP_TYPES.DIRECT,
    isAvailable: true,
  },
  {
    name: "Alchemix ETH",
    symbol: "alETH",
    decimals: 18,
    amount: BigNumber.from("0x00"),
    valueUSD: BigNumber.from("0x00"),
    swapType: SWAP_TYPES.DIRECT,
    isAvailable: true,
  },
  {
    name: "Synth sETH",
    symbol: "sETH",
    decimals: 18,
    amount: BigNumber.from("0x00"),
    valueUSD: BigNumber.from("0x00"),
    swapType: SWAP_TYPES.DIRECT,
    isAvailable: true,
  },
  {
    name: "sUSD",
    symbol: "sUSD",
    decimals: 18,
    amount: BigNumber.from("0x00"),
    valueUSD: BigNumber.from("0x00"),
    swapType: SWAP_TYPES.DIRECT,
    isAvailable: true,
  },
  {
    name: "tBTCv2",
    symbol: "TBTCv2",
    decimals: 18,
    amount: BigNumber.from("0x00"),
    valueUSD: BigNumber.from("0x00"),
    swapType: SWAP_TYPES.DIRECT,
    isAvailable: true,
  },
  {
    name: "Alchemix USD",
    symbol: "alUSD",
    decimals: 18,
    amount: BigNumber.from("0x00"),
    valueUSD: BigNumber.from("0x00"),
    swapType: SWAP_TYPES.DIRECT,
    isAvailable: false,
  },
  {
    name: "Fei Protocol",
    symbol: "FEI",
    decimals: 18,
    amount: BigNumber.from("0x00"),
    valueUSD: BigNumber.from("0x00"),
    swapType: SWAP_TYPES.DIRECT,
    isAvailable: false,
  },
  {
    name: "Frax",
    symbol: "FRAX",
    decimals: 18,
    amount: BigNumber.from("0x00"),
    valueUSD: BigNumber.from("0x00"),
    swapType: SWAP_TYPES.DIRECT,
    isAvailable: false,
  },
  {
    name: "Liquity USD",
    symbol: "LUSD",
    decimals: 18,
    amount: BigNumber.from("0x00"),
    valueUSD: BigNumber.from("0x00"),
    swapType: SWAP_TYPES.DIRECT,
    isAvailable: false,
  },
  {
    name: "Wrapped Celo USD",
    symbol: "wCUSD",
    decimals: 18,
    amount: BigNumber.from("0x00"),
    valueUSD: BigNumber.from("0x00"),
    swapType: SWAP_TYPES.DIRECT,
    isAvailable: false,
  },
]
export const SwapInput = Template.bind({})
SwapInput.args = {
  inputValue: "23",
  inputValueUSD: BigNumber.from("234245"),
  tokens: tokenOptionLists,
}
