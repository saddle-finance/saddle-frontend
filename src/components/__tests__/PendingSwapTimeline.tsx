import "@testing-library/jest-dom/extend-expect"

import { SWAP_TYPES, TOKENS_MAP } from "../../constants"
import { render, screen } from "@testing-library/react"

import { BigNumber } from "@ethersproject/bignumber"
import { PendingSwap } from "../../hooks/usePendingSwapData"
import PendingSwapTimeline from "../PendingSwapTimeline"
import React from "react"

const eventTime = Math.floor(new Date(2021, 1, 1).getTime() / 1000)
const secondsRemaining = 60 * 5
const basePendingSwap: PendingSwap = {
  swapType: SWAP_TYPES.INVALID,
  settleableAtTimestamp: eventTime + secondsRemaining,
  secondsRemaining,
  synthTokenFrom: TOKENS_MAP["sETH"],
  synthBalance: BigNumber.from("0"),
  tokenTo: TOKENS_MAP["WBTC"],
  itemId: "1",
  transactionHash: "0x0",
  timestamp: eventTime,
  events: [],
}

const buildPendingSwap = (partialSwap: Partial<PendingSwap>) => {
  return {
    ...basePendingSwap,
    ...partialSwap,
  }
}

jest.mock("react-i18next", () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => null),
      },
    }
  },
}))

it("renders a basic swap correctly", () => {
  const { asFragment } = render(
    <PendingSwapTimeline pendingSwap={basePendingSwap} />,
  )
  expect(
    screen.getByTestId("PendingSwapTimeline:minutesLeft"),
  ).toHaveTextContent("5 minutesLeft")
  expect(asFragment()).toMatchSnapshot()
})

it("renders a swap after the waiting period correctly", () => {
  const swap = buildPendingSwap({ secondsRemaining: 0 })
  const { asFragment } = render(<PendingSwapTimeline pendingSwap={swap} />)
  expect(asFragment()).toMatchSnapshot()
})

it("renders a swap with events correctly", () => {
  const settleEvent = {
    timestamp: eventTime + 10 * 60,
    itemId: "1",
    transactionHash: "0x1",
    type: "settlement" as const,
    fromToken: TOKENS_MAP["sBTC"],
    fromAmount: BigNumber.from(10).pow(17),
    toToken: TOKENS_MAP["WBTC"],
    toAmount: BigNumber.from(10).pow(17),
  }
  const withdrawEvent = {
    timestamp: eventTime + 11 * 60,
    itemId: "1",
    transactionHash: "0x2",
    type: "withdraw" as const,
    synthToken: TOKENS_MAP["sBTC"],
    amount: BigNumber.from(10).pow(17),
  }
  const swapWithEvents = buildPendingSwap({
    events: [settleEvent, withdrawEvent],
  })
  const { asFragment } = render(
    <PendingSwapTimeline pendingSwap={swapWithEvents} />,
  )
  expect(screen.getByTestId("PendingSwapTimeline:event-1")).toHaveTextContent(
    "settled",
  )
  expect(screen.getByTestId("PendingSwapTimeline:event-2")).toHaveTextContent(
    "withdrew",
  )

  expect(asFragment()).toMatchSnapshot()
})
