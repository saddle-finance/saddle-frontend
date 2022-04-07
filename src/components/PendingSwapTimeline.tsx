import {
  TimelineItem as MuiTimelineItem,
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineSeparator,
} from "@mui/lab"
import React, { ReactElement } from "react"
import { ReactComponent as ArrowDownIcon } from "../assets/icons/arrowDown.svg"
import { ReactComponent as CheckIcon } from "../assets/icons/check.svg"
import { ReactComponent as ClockIcon } from "../assets/icons/clock.svg"
import { PendingSwap } from "../hooks/usePendingSwapData"
import { commify } from "../utils"
import { formatBNToString } from "../utils"
import { getFormattedShortTime } from "../utils/dateTime"
import { styled } from "@mui/material"
import { useTranslation } from "react-i18next"

const TimelineItem = styled(MuiTimelineItem)(() => ({
  "&:before": {
    flex: "unset",
    padding: 0,
  },
}))
const PendingSwapTimeline = ({
  pendingSwap,
}: {
  pendingSwap: PendingSwap
}): ReactElement => {
  const { t } = useTranslation()
  const {
    secondsRemaining,
    tokenTo,
    synthBalance,
    synthTokenFrom,
    timestamp,
    transactionHash,
    events,
  } = pendingSwap
  const minutesRemaining = Math.max(Math.ceil(secondsRemaining / 60), 0)
  const formattedBalance = commify(
    formatBNToString(synthBalance, synthTokenFrom.decimals, 6),
  )
  const hasEvents = events.length > 0

  return (
    <Timeline position="right">
      <TimelineStep
        isActive={false}
        icon={<CheckIcon />}
        withLine={false}
        testId="PendingSwapTimeline:step1Of2"
      >
        {getFormattedShortTime(timestamp)} {t("stepAOfB", { a: 1, b: 2 })}{" "}
        {t("confirmTheSwap")}{" "}
        <a
          href={`https://etherscan.io/tx/${transactionHash}`}
          target="_blank"
          rel="noreferrer"
        >
          {transactionHash.slice(0, 8)}
        </a>
      </TimelineStep>
      {minutesRemaining > 0 ? (
        <TimelineStep
          isActive={true}
          icon={<ClockIcon />}
          testId="PendingSwapTimeline:minutesLeft"
        >
          {t("minutesLeft", { count: minutesRemaining })}
        </TimelineStep>
      ) : (
        <TimelineStep
          isActive={!hasEvents}
          icon={<CheckIcon />}
          testId="PendingSwapTimeline:swappedForAmount"
        >
          {getFormattedShortTime(timestamp)}{" "}
          {t("swappedForAmount", { amount: formattedBalance })}{" "}
          {synthTokenFrom.symbol}
        </TimelineStep>
      )}
      {!hasEvents ? (
        <TimelineStep
          isActive={false}
          icon={<ArrowDownIcon />}
          testId="PendingSwapTimeline:step2Of2"
        >
          {t("stepAOfB", { a: 2, b: 2 })}{" "}
          {t("settleToken", { name: tokenTo.symbol })}{" "}
        </TimelineStep>
      ) : null}
      {events.map((event, i) => {
        if (event.type === "settlement") {
          return (
            <TimelineStep
              isActive={false}
              icon={<CheckIcon />}
              key={event.transactionHash}
              testId={`PendingSwapTimeline:event-${i + 1}`}
            >
              {getFormattedShortTime(event.timestamp)}{" "}
              {t("settledXTokenForYToken", {
                amountFrom: commify(
                  formatBNToString(
                    event.fromAmount,
                    event.fromToken.decimals,
                    6,
                  ),
                ),
                nameFrom: event.fromToken.symbol,
                amountTo: commify(
                  formatBNToString(event.toAmount, event.toToken.decimals, 6),
                ),
                nameTo: event.toToken.symbol,
              })}
            </TimelineStep>
          )
        } else if (event.type === "withdraw") {
          const formattedAmount = commify(
            formatBNToString(event.amount, event.synthToken.decimals, 6),
          )
          return (
            <TimelineStep
              isActive={false}
              icon={<CheckIcon />}
              key={i}
              testId={`PendingSwapTimeline:event-${i + 1}`}
            >
              {getFormattedShortTime(event.timestamp)}{" "}
              {t("withdrewNToken", {
                amount: formattedAmount,
                name: event.synthToken.symbol,
              })}
            </TimelineStep>
          )
        }
      })}
    </Timeline>
  )
}
export default PendingSwapTimeline

const TimelineStep = ({
  isActive,
  icon,
  children,
  testId,
  withLine = true,
}: React.PropsWithChildren<{
  isActive: boolean
  icon: React.ReactNode
  testId?: string
  withLine?: boolean
}>) => {
  console.log("first", isActive)
  return (
    <TimelineItem data-testid={testId || null}>
      <TimelineSeparator>
        {withLine && <TimelineConnector />}
        <TimelineDot>{icon}</TimelineDot>
      </TimelineSeparator>
      <TimelineContent>{children}</TimelineContent>
    </TimelineItem>
  )
}
