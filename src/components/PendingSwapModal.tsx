import React, { ReactElement } from "react"

import { ReactComponent as InfoIcon } from "../assets/icons/info.svg"
import { PendingSwap } from "../hooks/usePendingSwapData"
import PendingSwapExchange from "./PendingSwapExchange"
import PendingSwapTimeline from "./PendingSwapTimeline"
import { formatBNToString } from "../utils"
import styles from "./PendingSwapModal.module.scss"
import { useTranslation } from "react-i18next"

const PendingSwapModal = ({
  pendingSwap,
}: {
  pendingSwap: PendingSwap
  onClose: () => void
}): ReactElement => {
  const { t } = useTranslation()
  const {
    secondsRemaining,
    tokenTo,
    synthBalance,
    synthTokenFrom,
  } = pendingSwap
  const minutesRemaining = Math.max(Math.ceil(secondsRemaining / 60), 0)
  const formattedBalance = formatBNToString(
    synthBalance,
    synthTokenFrom.decimals,
    6,
  )

  return (
    <div className={styles.virtualSwapModal}>
      <div className={styles.headerContent}>
        <b className={styles.title}>
          {formattedBalance} {synthTokenFrom.symbol} {"->"} {tokenTo.symbol}
        </b>
      </div>
      <div className={styles.centerContent}>
        {minutesRemaining === 0 ? (
          <PendingSwapExchange pendingSwap={pendingSwap} />
        ) : (
          <div className={styles.timer}>
            <h2>
              {minutesRemaining} {t("minRemaining")}
            </h2>
          </div>
        )}
      </div>
      <div className={styles.footerContent}>
        <b className={styles.title}>{t("swapTimeline")}</b>
        <PendingSwapTimeline pendingSwap={pendingSwap} />
        <div className={styles.about}>
          <InfoIcon />
          <span>{t("aboutVirtualSwap")}</span>
        </div>
      </div>
    </div>
  )
}

export default PendingSwapModal
