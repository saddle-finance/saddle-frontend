import "./MyActivityCard.scss"

import React, { ReactElement } from "react"

import { HistoricalPoolDataType } from "../hooks/useHistoricalPoolData"
import { formatBNToString } from "../utils"
import { useTranslation } from "react-i18next"

interface Props {
  historicalPoolData: HistoricalPoolDataType | null
}

function MyActivityCard({ historicalPoolData }: Props): ReactElement | null {
  const { t } = useTranslation()

  if (!historicalPoolData) return null

  const historicalFormattedData = historicalPoolData
    ? {
        totalDepositsBTC: formatBNToString(
          historicalPoolData.totalDepositsBTC,
          36,
          6,
        ),
        totalWithdrawalsBTC: formatBNToString(
          historicalPoolData.totalWithdrawalsBTC,
          36,
          6,
        ),
        totalProfitBTC: formatBNToString(
          historicalPoolData.totalProfitBTC,
          36,
          6,
        ),
        totalDepositsUSD: formatBNToString(
          historicalPoolData.totalDepositsUSD,
          36,
          2,
        ),
        totalWithdrawalsUSD: formatBNToString(
          historicalPoolData.totalWithdrawalsUSD,
          36,
          2,
        ),
        totalProfitUSD: formatBNToString(
          historicalPoolData.totalProfitUSD,
          36,
          2,
        ),
      }
    : null

  return (
    <div className="myActivityCard">
      <h4>{t("myActivity")}</h4>
      {historicalFormattedData ? (
        <div className="activityTable">
          <div key="deposits-btc">
            <span className="label">BTC {t("deposit")}</span>
            <span>{historicalFormattedData.totalDepositsBTC}</span>
          </div>
          <div key="deposits-usd">
            <span className="label">USD {t("deposit")}</span>
            <span>{`$${historicalFormattedData.totalDepositsUSD}`}</span>
          </div>
          <div key="withdrawals-btc">
            <span className="label">BTC {t("withdrawal")}</span>
            <span>{historicalFormattedData.totalWithdrawalsBTC}</span>
          </div>
          <div key="withdrawals-usd">
            <span className="label">USD {t("withdrawal")}</span>
            <span>{`$${historicalFormattedData.totalWithdrawalsUSD}`}</span>
          </div>
          <div key="profit-btc">
            <span className="label">BTC {t("profit")}</span>
            <span>{historicalFormattedData.totalProfitBTC}</span>
          </div>
          <div key="profit-usd">
            <span className="label">USD {t("profit")}</span>
            <span>{`$${historicalFormattedData.totalProfitUSD}`}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default MyActivityCard
