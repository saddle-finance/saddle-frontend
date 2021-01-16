import "./MyShareCard.scss"

import React, { ReactElement } from "react"
import { HistoricalPoolDataType } from "../hooks/useHistoricalPoolData"
import { TOKENS_MAP } from "../constants"
import { UserShareType } from "../hooks/usePoolData"
import { formatUnits } from "@ethersproject/units"
import { useTranslation } from "react-i18next"

interface Props {
  data: UserShareType | null
  historicalPoolData: HistoricalPoolDataType | null
}

function MyShareCard({ data, historicalPoolData }: Props): ReactElement | null {
  const { t } = useTranslation()

  if (!data) return null

  const formattedData = {
    share: (parseFloat(formatUnits(data.share, 18)) * 100).toFixed(2),
    usdBalance: parseFloat(formatUnits(data.usdBalance, 18)).toFixed(2),
    value: parseFloat(formatUnits(data.value, 18)).toFixed(5),
    tokens: data.tokens.map((coin) => {
      const token = TOKENS_MAP[coin.symbol]
      return {
        symbol: token.symbol,
        name: token.name,
        value: parseFloat(formatUnits(coin.value, 18)).toFixed(3),
      }
    }),
  }

  const historicalFormattedData = historicalPoolData
    ? {
        totalDepositsBTC: parseFloat(
          formatUnits(historicalPoolData.totalDepositsBTC, 36),
        ).toFixed(5),
        totalWithdrawalsBTC: parseFloat(
          formatUnits(historicalPoolData.totalWithdrawalsBTC, 36),
        ).toFixed(5),
        totalDepositsUSD: parseFloat(
          formatUnits(historicalPoolData.totalDepositsUSD, 36),
        ).toFixed(),
        totalWithdrawalsUSD: parseFloat(
          formatUnits(historicalPoolData.totalWithdrawalsUSD, 36),
        ).toFixed(),
        totalProfitBTC: parseFloat(
          formatUnits(historicalPoolData.totalProfitBTC, 36),
        ).toFixed(5),
        totalProfitUSD: parseFloat(
          formatUnits(historicalPoolData.totalProfitUSD, 36),
        ).toFixed(),
      }
    : null

  return (
    <div className="myShareCard">
      <h4>{t("myShare")}</h4>
      <div className="info">
        <div className="poolShare">
          <span>
            {formattedData.share}% {t("ofPool")}
          </span>
        </div>
        <div className="balance">
          <span>
            {t("usdBalance")}: {formattedData.usdBalance}
          </span>
        </div>
        <div className="amount">
          <span>
            {t("totalAmount")}: {formattedData.value}
          </span>
        </div>
      </div>
      <div className="currency">
        {formattedData.tokens.map((coin) => (
          <div key={coin.symbol}>
            <span className="tokenName">{coin.name}</span>
            <span>{coin.value}</span>
          </div>
        ))}
      </div>
      {historicalFormattedData ? (
        <div className="historicalPoolData">
          <div key="deposits-btc">
            <span className="label">Total Deposits (BTC): </span>
            <span>{historicalFormattedData.totalDepositsBTC}</span>
          </div>
          <div key="withdrawals-btc">
            <span className="label">Total Withdrawals (BTC): </span>
            <span>{historicalFormattedData.totalWithdrawalsBTC}</span>
          </div>
          <div key="profit-btc">
            <span className="label">Total Profit (BTC): </span>
            <span>{historicalFormattedData.totalProfitBTC}</span>
          </div>
          <div key="deposits-usd">
            <span className="label">Total Deposits (USD): </span>
            <span>{historicalFormattedData.totalDepositsUSD}</span>
          </div>
          <div key="withdrawals-usd">
            <span className="label">Total Withdrawals (USD): </span>
            <span>{historicalFormattedData.totalWithdrawalsUSD}</span>
          </div>
          <div key="profit-usd">
            <span className="label">Total Profit (USD): </span>
            <span>{historicalFormattedData.totalProfitUSD}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default MyShareCard
