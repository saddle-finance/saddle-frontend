import "./ReviewDeposit.scss"

import React, { ReactElement } from "react"

import { GasPrices } from "../state/user"
import { useTranslation } from "react-i18next"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  onClose: () => void
  onConfirm: () => void
  data: {
    deposit: Array<{ [key: string]: any }>
    rates: Array<{ [key: string]: any }>
    share: number
    keep: number
    slippage: string
  }
  gas: GasPrices
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function ReviewDeposit({ onClose, onConfirm, data, gas }: Props): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="reviewDeposit">
      <h3>{t("reviewDeposit")}</h3>
      <div className="table">
        <div className="tokenList">
          {data.deposit.map((token, index) => (
            <div className="eachToken" key={index}>
              <div className="value">
                <span className="value">{token.value}</span>
              </div>
              <div className="token">
                <img src={token.icon} alt="icon" />
                <span>{token.name}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="divider" style={{ height: "1px", width: "100%" }}></div>
        <div className="depositInfoItem">
          <span className="label">{t("shareOfPool")}</span>
          <span className="value">{data.share}%</span>
        </div>
        <div className="depositInfoItem">
          <span className="label">{t("gas")}</span>
          <span className="value">{gas}</span>
        </div>
        <div className="depositInfoItem">
          <span className="label">{t("maxSlippage")}</span>
          <span className="value">{data.slippage}%</span>
        </div>
        <div className="depositInfoItem">
          <span className="label">{t("rates")}</span>
          <div className="rates value">
            {data.rates.map((rate, index) => (
              <span key={index}>
                1 {rate.name}={rate.rate} USD
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="bottom">
        <span>{`${t("youWillReceive")} ${data.keep} KEEP ${t(
          "poolTokens",
        )}`}</span>
        <div className="divider" style={{ height: "1px", width: "100%" }}></div>
        <p>{t("estimatedOutput")}</p>
        <button onClick={onConfirm} className="confirm">
          {t("confirmDeposit")}
        </button>
        <button onClick={onClose} className="cancel">
          {t("cancel")}
        </button>
      </div>
    </div>
  )
}

export default ReviewDeposit
