import "./ReviewWithdraw.scss"

import React, { ReactElement, useState } from "react"
import { commify, formatBNToString, formatDeadlineToNumber } from "../utils"

import { AppState } from "../state/index"
import Button from "./Button"
import { GasPrices } from "../state/user"
import HighPriceImpactConfirmation from "./HighPriceImpactConfirmation"
import { ReviewWithdrawData } from "./WithdrawPage"
import { formatGasToString } from "../utils/gas"
import { formatSlippageToString } from "../utils/slippage"
import { isHighPriceImpact } from "../utils/priceImpact"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  onClose: () => void
  onConfirm: () => void
  data: ReviewWithdrawData
  gas: GasPrices
}

function ReviewWithdraw({ onClose, onConfirm, data }: Props): ReactElement {
  const { t } = useTranslation()
  const {
    slippageCustom,
    slippageSelected,
    gasPriceSelected,
    gasCustom,
    transactionDeadlineSelected,
    transactionDeadlineCustom,
  } = useSelector((state: AppState) => state.user)
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const [
    hasConfirmedHighPriceImpact,
    setHasConfirmedHighPriceImpact,
  ] = useState(false)
  const isHighSlippageTxn = isHighPriceImpact(data.priceImpact)
  const deadline = formatDeadlineToNumber(
    transactionDeadlineSelected,
    transactionDeadlineCustom,
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
        {data.txnGasCost?.valueUSD && (
          <div className="withdrawInfoItem">
            <span className="label">{t("estimatedTxCost")}</span>
            <span className="value">
              {`≈$${commify(formatBNToString(data.txnGasCost.valueUSD, 2, 2))}`}{" "}
            </span>
          </div>
        )}
        <div className="withdrawInfoItem">
          <span className="label">{t("maxSlippage")}</span>
          <span className="value">
            {formatSlippageToString(slippageSelected, slippageCustom)}%
          </span>
        </div>
        <div className="withdrawInfoItem">
          <span className="label">{t("deadline")}</span>
          <span className="value">
            {deadline} {t("minutes")}
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
      {isHighSlippageTxn && (
        <div className="withdrawInfoItem">
          <HighPriceImpactConfirmation
            checked={hasConfirmedHighPriceImpact}
            onCheck={(): void =>
              setHasConfirmedHighPriceImpact((prevState) => !prevState)
            }
          />
        </div>
      )}
      <div className="bottom">
        <p>{t("estimatedOutput")}</p>
        <div className="buttonWrapper">
          <Button
            onClick={onConfirm}
            kind="primary"
            disabled={isHighSlippageTxn && !hasConfirmedHighPriceImpact}
          >
            {t("confirmWithdraw")}
          </Button>
          <Button onClick={onClose} kind="cancel">
            {t("cancel")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ReviewWithdraw
