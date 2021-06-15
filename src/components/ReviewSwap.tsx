import "./ReviewSwap.scss"

import React, { ReactElement, useState } from "react"
import { commify, formatBNToString, formatDeadlineToNumber } from "../utils"

import { AppState } from "../state/index"
import { BigNumber } from "@ethersproject/bignumber"
import Button from "./Button"
import HighPriceImpactConfirmation from "./HighPriceImpactConfirmation"
import { TOKENS_MAP } from "../constants"
import { formatGasToString } from "../utils/gas"
import { formatSlippageToString } from "../utils/slippage"
import iconDown from "../assets/icons/icon_down.svg"
import { isHighPriceImpact } from "../utils/priceImpact"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  onClose: () => void
  onConfirm: () => void
  data: {
    from: { symbol: string; value: string }
    to: { symbol: string; value: string }
    exchangeRateInfo: {
      pair: string
      priceImpact: BigNumber
      exchangeRate: BigNumber
    }
    txnGasCost: {
      amount: BigNumber
      valueUSD: BigNumber | null // amount * ethPriceUSD
    }
  }
}

function ReviewSwap({ onClose, onConfirm, data }: Props): ReactElement {
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
  const fromToken = TOKENS_MAP[data.from.symbol]
  const toToken = TOKENS_MAP[data.to.symbol]
  const isHighPriceImpactTxn = isHighPriceImpact(
    data.exchangeRateInfo.priceImpact,
  )
  const deadline = formatDeadlineToNumber(
    transactionDeadlineSelected,
    transactionDeadlineCustom,
  )

  return (
    <div className="reviewSwap">
      <h3>{t("reviewSwap")}</h3>
      <div className="swapTable">
        <div className="from">
          <img className="tokenIcon" src={fromToken.icon} alt="icon" />
          <span className="tokenName">{data.from.symbol}</span>
          <div className="floatRight">
            <span>{data.from.value}</span>
          </div>
        </div>
        <img src={iconDown} alt="to" className="arrowDown" />
        <div className="to">
          <img className="tokenIcon" src={toToken.icon} alt="icon" />
          <span className="tokenName">{data.to.symbol}</span>
          <div className="floatRight">
            <span>{data.to.value}</span>
          </div>
        </div>
        <div className="divider" style={{ height: "1px", width: "100%" }} />
        <div className="swapInfo">
          <div className="priceTable">
            <span className="title">{t("price")}</span>
            <span className="pair">{data.exchangeRateInfo.pair}</span>
            <button className="exchange">
              <svg
                width="24"
                height="20"
                viewBox="0 0 24 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.4011 12.4196C17.4011 13.7551 16.5999 13.8505 16.4472 13.8505H6.62679L9.14986 11.3274L8.47736 10.6501L5.13869 13.9888C5.04986 14.0782 5 14.1991 5 14.3251C5 14.4511 5.04986 14.572 5.13869 14.6613L8.47736 18L9.14986 17.3275L6.62679 14.8044H16.4472C17.1054 14.8044 18.355 14.3274 18.355 12.4196V10.9888H17.4011V12.4196Z"
                  fill="#D67A0A"
                />
                <path
                  d="M5.9539 7.58511C5.9539 6.24965 6.75519 6.15426 6.90781 6.15426H16.7283L14.2052 8.67733L14.8777 9.34984L18.2164 6.01117C18.3052 5.92181 18.355 5.80092 18.355 5.67492C18.355 5.54891 18.3052 5.42803 18.2164 5.33867L14.8777 2L14.2004 2.67727L16.7283 5.20035H6.90781C6.24962 5.20035 5 5.6773 5 7.58511V9.01597H5.9539V7.58511Z"
                  fill="#D67A0A"
                />
              </svg>
            </button>
            <span className="value floatRight">
              {formatBNToString(data.exchangeRateInfo.exchangeRate, 18, 4)}
            </span>
          </div>
          <div className="row">
            <span className="title">{t("gas")}</span>
            <span className="value floatRight">
              {formatGasToString(
                { gasStandard, gasFast, gasInstant },
                gasPriceSelected,
                gasCustom,
              )}{" "}
              GWEI
            </span>
          </div>
          {data.txnGasCost?.valueUSD && (
            <div className="row">
              <span className="title">{t("estimatedTxCost")}</span>
              <span className="value floatRight">
                {`≈$${commify(
                  formatBNToString(data.txnGasCost.valueUSD, 2, 2),
                )}`}
              </span>
            </div>
          )}
          <div className="row">
            <span className="title">{t("maxSlippage")}</span>
            <span className="value floatRight">
              {formatSlippageToString(slippageSelected, slippageCustom)}%
            </span>
          </div>
          <div className="row">
            <span className="title">{t("deadline")}</span>
            <span className="value floatRight">
              {deadline} {t("minutes")}
            </span>
          </div>
          {isHighPriceImpactTxn && (
            <div className="row">
              <HighPriceImpactConfirmation
                checked={hasConfirmedHighPriceImpact}
                onCheck={(): void =>
                  setHasConfirmedHighPriceImpact((prevState) => !prevState)
                }
              />
            </div>
          )}
        </div>
      </div>
      <div className="bottom">
        <p>{t("estimatedOutput")}</p>
        <div className="buttonWrapper">
          <Button
            onClick={onConfirm}
            kind="primary"
            disabled={isHighPriceImpactTxn && !hasConfirmedHighPriceImpact}
          >
            {t("confirmSwap")}
          </Button>
          <Button onClick={onClose} kind="cancel">
            {t("cancel")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ReviewSwap
