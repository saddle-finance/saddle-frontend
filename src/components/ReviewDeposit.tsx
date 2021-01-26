import "./ReviewDeposit.scss"

import React, { ReactElement, useState } from "react"
import { formatSlippageToString, isHighSlippage } from "../utils/slippage"

import { AppState } from "../state/index"
import { BigNumber } from "@ethersproject/bignumber"
import Button from "./Button"
import HighSlippageConfirmation from "./HighSlippageConfirmation"
import { formatGasToString } from "../utils/gas"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  onClose: () => void
  onConfirm: () => void
  data: {
    deposit: Array<{ [key: string]: any }>
    rates: Array<{ [key: string]: any }>
    shareOfPool: string
    lpToken: string
    bonusOrSlippage: BigNumber
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function ReviewDeposit({ onClose, onConfirm, data }: Props): ReactElement {
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
  const [hasConfirmedHighSlippage, setHasConfirmedHighSlippage] = useState(
    false,
  )
  const isHighSlippageTxn = isHighSlippage(data.bonusOrSlippage)

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
          <span className="value">{data.shareOfPool}%</span>
        </div>
        <div className="depositInfoItem">
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
        <div className="depositInfoItem">
          <span className="label">{t("maxSlippage")}</span>
          <span className="value">
            {formatSlippageToString(slippageSelected, slippageCustom)}%
          </span>
        </div>
        <div className="depositInfoItem">
          <span className="label">{t("rates")}</span>
          <div className="rates value">
            {data.rates.map((rate, index) => (
              <span key={index}>
                1 {rate.name} = ${rate.rate}
              </span>
            ))}
          </div>
        </div>
      </div>
      {isHighSlippageTxn && (
        <HighSlippageConfirmation
          checked={hasConfirmedHighSlippage}
          onCheck={(): void =>
            setHasConfirmedHighSlippage((prevState) => !prevState)
          }
        />
      )}
      <div className="bottom">
        <span>{`${t("youWillReceive")} ${data.lpToken} ${t("lpTokens")}`}</span>
        <div className="divider" style={{ height: "1px", width: "100%" }}></div>
        <p>{t("estimatedOutput")}</p>
        <div className="buttonWrapper">
          <Button
            onClick={onConfirm}
            kind="primary"
            size="large"
            disabled={isHighSlippageTxn && !hasConfirmedHighSlippage}
          >
            {t("confirmDeposit")}
          </Button>
          <Button onClick={onClose} kind="secondary" size="large">
            {t("cancel")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ReviewDeposit
