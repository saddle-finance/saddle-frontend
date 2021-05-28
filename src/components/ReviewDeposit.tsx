import "./ReviewDeposit.scss"

import React, { ReactElement, useState } from "react"
import {
  commify,
  formatBNToPercentString,
  formatBNToString,
  formatDeadlineToNumber,
} from "../utils"

import { AppState } from "../state/index"
import Button from "./Button"
import { DepositTransaction } from "../interfaces/transactions"
import HighPriceImpactConfirmation from "./HighPriceImpactConfirmation"
import { formatGasToString } from "../utils/gas"
import { formatSlippageToString } from "../utils/slippage"
import { isHighPriceImpact } from "../utils/priceImpact"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  onClose: () => void
  onConfirm: () => void
  transactionData: DepositTransaction
}

function ReviewDeposit({
  onClose,
  onConfirm,
  transactionData,
}: Props): ReactElement {
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
  const isHighPriceImpactTxn = isHighPriceImpact(transactionData.priceImpact)
  const deadline = formatDeadlineToNumber(
    transactionDeadlineSelected,
    transactionDeadlineCustom,
  )
  return (
    <div className="reviewDeposit">
      <h3>{t("reviewDeposit")}</h3>
      <div className="table">
        <h4>{t("depositing")}</h4>
        <div className="tokenList">
          {transactionData.from.items.map(({ token, amount }) => (
            <div className="eachToken" key={token.symbol}>
              <div className="token">
                <img src={token.icon} alt="icon" />
                <span>{token.symbol}</span>
              </div>
              <div className="value">
                <span className="value">
                  {commify(formatBNToString(amount, token.decimals))}
                </span>
              </div>
            </div>
          ))}
          <div className="eachToken">
            <div className="token">
              <b>{t("total")}</b>
            </div>
            <div className="value">
              <b className="value">
                {commify(
                  formatBNToString(transactionData.from.totalAmount, 18),
                )}
              </b>
            </div>
          </div>
        </div>
        <div className="divider" style={{ height: "1px", width: "100%" }}></div>
        <h4>{t("receiving")}</h4>
        <div className="tokenList">
          <div className="eachToken" key={transactionData.to.item.token.symbol}>
            <div className="token">
              <img src={transactionData.to.item.token.icon} alt="icon" />
              <span>{transactionData.to.item.token.symbol}</span>
            </div>
            <div className="value">
              <span className="value">
                {commify(
                  formatBNToString(
                    transactionData.to.item.amount,
                    transactionData.to.item.token.decimals,
                  ),
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="divider" style={{ height: "1px", width: "100%" }}></div>
        <div className="depositInfoItem">
          <span className="label">{t("shareOfPool")}</span>
          <span className="value">
            {formatBNToPercentString(transactionData.shareOfPool, 18)}
          </span>
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
        {transactionData.txnGasCost?.valueUSD && (
          <div className="depositInfoItem">
            <span className="label">{t("estimatedTxCost")}</span>
            <span className="value">
              {`≈$${commify(
                formatBNToString(transactionData.txnGasCost.valueUSD, 2, 2),
              )}`}
            </span>
          </div>
        )}
        <div className="depositInfoItem">
          <span className="label">{t("maxSlippage")}</span>
          <span className="value">
            {formatSlippageToString(slippageSelected, slippageCustom)}%
          </span>
        </div>
        <div className="depositInfoItem">
          <span className="label">{t("deadline")}</span>
          <span className="value">
            {deadline} {t("minutes")}
          </span>
        </div>
        <div className="depositInfoItem">
          <span className="label">{t("rates")}</span>
          <div className="rates value">
            {transactionData.from.items.map(
              ({ token, singleTokenPriceUSD }) => (
                <span key={token.symbol}>
                  1 {token.symbol} = $
                  {commify(formatBNToString(singleTokenPriceUSD, 18, 2))}
                </span>
              ),
            )}
            {[transactionData.to.item].map(({ token, singleTokenPriceUSD }) => (
              <span key={token.symbol}>
                1 {token.symbol} = $
                {commify(formatBNToString(singleTokenPriceUSD, 18, 2))}
              </span>
            ))}
          </div>
        </div>
      </div>
      {isHighPriceImpactTxn && (
        <HighPriceImpactConfirmation
          checked={hasConfirmedHighPriceImpact}
          onCheck={(): void =>
            setHasConfirmedHighPriceImpact((prevState) => !prevState)
          }
        />
      )}
      <div className="bottom">
        <p>{t("estimatedOutput")}</p>
        <div className="buttonWrapper">
          <Button
            onClick={onConfirm}
            kind="primary"
            size="large"
            disabled={isHighPriceImpactTxn && !hasConfirmedHighPriceImpact}
          >
            {t("confirmDeposit")}
          </Button>
          <Button onClick={onClose} kind="cancel" size="large">
            {t("cancel")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ReviewDeposit
