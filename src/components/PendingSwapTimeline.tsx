import React, { ReactElement } from "react"

import { ReactComponent as ArrowDownIcon } from "../assets/icons/arrowDown.svg"
import { ReactComponent as CheckIcon } from "../assets/icons/check.svg"
import { ReactComponent as ClockIcon } from "../assets/icons/clock.svg"
import { PendingSwap } from "../hooks/usePendingSwapData"
import classNames from "classnames"
import { commify } from "../utils"
import { formatBNToString } from "../utils"
import { getFormattedShortTime } from "../utils/dateTime"
import styles from "./PendingSwapTimeline.module.scss"
import { useTranslation } from "react-i18next"

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
    <div className={styles.timeline}>
      <TimelineStep
        isActive={false}
        icon="check"
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
          icon="clock"
          testId="PendingSwapTimeline:minutesLeft"
        >
          {t("minutesLeft", { count: minutesRemaining })}
        </TimelineStep>
      ) : (
        <TimelineStep
          isActive={!hasEvents}
          icon="check"
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
          icon="arrow"
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
              icon="check"
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
              icon="check"
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
    </div>
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
  icon: string
  testId?: string
  withLine?: boolean
}>) => {
  let iconEl = null
  if (icon === "check") {
    iconEl = <CheckIcon />
  } else if (icon === "clock") {
    iconEl = <ClockIcon />
  } else if (icon === "arrow") {
    iconEl = <ArrowDownIcon />
  }
  return (
    <div
      className={classNames(
        styles.timelineStep,
        isActive ? styles.active : styles.inactive,
      )}
      data-testid={testId || null}
    >
      {withLine ? <Line /> : null}
      {iconEl} {children}
    </div>
  )
}

const Line = () => <div className={styles.timelineLine} />
