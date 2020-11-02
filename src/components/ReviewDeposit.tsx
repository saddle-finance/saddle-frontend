import "./ReviewDeposit.scss"

import React, { ReactElement } from "react"

import { useTranslation } from "react-i18next"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  onClose: () => void
  onConfirm: () => void
  data: {
    deposit: Array<{ [key: string]: any }>
    rates: Array<{ [key: string]: any }>
    share: number
    sadd: number
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function ReviewDeposit({ onClose, onConfirm, data }: Props): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="reviewDeposit">
      <h3>{t("reviewDeposit")}</h3>
      <div className="table">
        <div className="tokenList">
          {data.deposit.map((each, index) => (
            <div className="eachToken" key={index}>
              <div className="value">
                <span className="value">{each.value}</span>
              </div>
              <div className="token">
                <img src={each.icon} alt="icon" />
                <span>{each.name}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="divider" style={{ height: "1px", width: "100%" }}></div>
        <div className="depositInfoItem">
          <span className="label">{t("yourPoolShare")}</span>
          <span className="value">{data.share}%</span>
        </div>
        <div className="depositInfoItem">
          <span className="label">{`${t("rates")}:`}</span>
          <div className="rates value">
            {data.rates.map((each, index) => (
              <span key={index}>
                1 {each.name} = {each.rate} USD
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="bottom">
        <span>{`${t("youWillReceive")} ${data.sadd} SADL ${t(
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
