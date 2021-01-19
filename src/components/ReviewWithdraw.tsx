import "./ReviewWithdraw.scss"

import React, { ReactElement } from "react"

import { AppState } from "../state/index"
import { GasPrices } from "../state/user"
import { formatGasToString } from "../utils/gas"
import { formatSlippageToString } from "../utils/slippage"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  onClose: () => void
  onConfirm: () => void
  data: {
    withdraw: Array<{ [key: string]: any }>
    rates: Array<{ [key: string]: any }>
    share: number
    keepToken: number
  }
  gas: GasPrices
}
/* eslint-enable @typescript-eslint/no-explicit-any */
function ReviewWithdraw({ onClose, onConfirm, data }: Props): ReactElement {
  const { t } = useTranslation()
  const {
    slippageCustom,
    slippageSelected,
    gasPriceSelected,
    gasCustom,
  } = useSelector((state: AppState) => state.user)
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )

  return (
    <div className="reviewWithdraw">
      <h3>{t("youWillReceive")}</h3>
      <div className="table">
        <div className="tokenList">
          {data.withdraw.map((token, index) => (
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
        <div className="divider"></div>
        <div className="withdrawInfoItem">
          <span className="label">{t("shareOfPool")}</span>
          <span className="value">{data.share}%</span>
        </div>
        <div className="withdrawInfoItem">
          <span className="label">{t("gas")}</span>
          <span className="value">
            {formatGasToString(
              { gasStandard, gasFast, gasInstant },
              gasPriceSelected,
              gasCustom,
            )}{" "}
            GWEI
          </span>
        </div>
        <div className="withdrawInfoItem">
          <span className="label">{t("maxSlippage")}</span>
          <span className="value">
            {formatSlippageToString(slippageSelected, slippageCustom)}%
          </span>
        </div>
        <div className="withdrawInfoItem">
          <span className="label">{`${t("rates")}:`}</span>
          <div className="rates value">
            {data.rates.map((rate, index) => (
              <span key={index}>
                1 {rate.name} = ${rate.rate}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="bottom">
        <p>{t("estimatedOutput")}</p>
        <button onClick={onConfirm} className="confirm">
          {t("confirmWithdraw")}
        </button>
        <button onClick={onClose} className="cancel">
          {t("cancel")}
        </button>
      </div>
    </div>
  )
}

export default ReviewWithdraw
