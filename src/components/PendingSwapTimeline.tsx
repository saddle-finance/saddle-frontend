import { Link, SvgIconTypeMap, styled, useTheme } from "@mui/material"
import {
  TimelineItem as MuiTimelineItem,
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineSeparator,
} from "@mui/lab"
import React, { ReactElement } from "react"
import ArrowDownIcon from "@mui/icons-material/ArrowDownward"
import CheckIcon from "@mui/icons-material/Check"
import ClockIcon from "@mui/icons-material/AccessTime"
import { OverridableComponent } from "@mui/material/OverridableComponent"
import { PendingSwap } from "../hooks/usePendingSwapData"
import { commify } from "../utils"
import { formatBNToString } from "../utils"
import { getFormattedShortTime } from "../utils/dateTime"
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
  if (!tokenTo || !synthTokenFrom) return <></>
  const formattedBalance = commify(
    formatBNToString(synthBalance, synthTokenFrom.decimals, 6),
  )
  const hasEvents = events.length > 0

  return (
    <Timeline position="right" sx={{ padding: 0 }}>
      <TimelineStep
        isActive={false}
        icon={CheckIcon}
        testId="PendingSwapTimeline:step1Of2"
      >
        {getFormattedShortTime(timestamp)} {t("stepAOfB", { a: 1, b: 2 })}
        {" - "}
        {t("confirmTheSwap")}{" "}
        <Link
          href={`https://etherscan.io/tx/${transactionHash}`}
          target="_blank"
          rel="noreferrer"
        >
          {transactionHash.slice(0, 8)}
        </Link>
      </TimelineStep>
      {minutesRemaining > 0 ? (
        <TimelineStep
          isActive={true}
          icon={ClockIcon}
          testId="PendingSwapTimeline:minutesLeft"
        >
          {t("minutesLeft", { count: minutesRemaining })}
        </TimelineStep>
      ) : (
        <TimelineStep
          isActive={!hasEvents}
          icon={CheckIcon}
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
          icon={ArrowDownIcon}
          testId="PendingSwapTimeline:step2Of2"
          withLine={false}
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
              icon={CheckIcon}
              key={event.transactionHash}
              testId={`PendingSwapTimeline:event-${i + 1}`}
              withLine={false}
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
              icon={CheckIcon}
              key={i}
              testId={`PendingSwapTimeline:event-${i + 1}`}
              withLine={false}
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
  icon: Icon,
  children,
  testId,
  withLine = true,
}: React.PropsWithChildren<{
  isActive: boolean
  icon: OverridableComponent<SvgIconTypeMap>
  testId?: string
  withLine?: boolean
}>) => {
  const theme = useTheme()
  return (
    <TimelineItem data-testid={testId || null}>
      <TimelineSeparator>
        <TimelineDot
          sx={{
            backgroundColor: isActive
              ? theme.palette.primary.main
              : theme.palette.text.secondary,
            width: 12,
            height: 12,
          }}
        />
        {withLine && (
          <TimelineConnector
            sx={{ background: theme.palette.text.secondary }}
          />
        )}
      </TimelineSeparator>
      {/* TimelineContent is extended Typography so props of Typography works for this component */}
      <TimelineContent
        variant={isActive ? "subtitle2" : "body2"}
        color={isActive ? "primary" : "text.secondary"}
      >
        <Icon
          sx={{
            height: 16,
            width: 16,
            marginRight: 1,
            marginBottom: "-4px",
          }}
        />
        {children}
      </TimelineContent>
    </TimelineItem>
  )
}
