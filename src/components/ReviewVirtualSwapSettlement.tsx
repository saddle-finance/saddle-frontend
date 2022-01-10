import "./ReviewSwap.scss"

import React, { ReactElement, useState } from "react"
import { SWAP_TYPES, TOKENS_MAP } from "../constants"
import { commify, formatBNToString, formatDeadlineToNumber } from "../utils"

import { AppState } from "../state/index"
import { BigNumber } from "@ethersproject/bignumber"
import Button from "./Button"
import HighPriceImpactConfirmation from "./HighPriceImpactConfirmation"
import { ReactComponent as ThinArrowDown } from "../assets/icons/thinArrowDown.svg"
import { formatGasToString } from "../utils/gas"
import { formatSlippageToString } from "../utils/slippage"
import { isHighPriceImpact } from "../utils/priceImpact"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  onClose: () => void
  onConfirm: () => void
  data: {
    from: { symbol: string; value: string }
    to?: { symbol: string; value: string }
    swapType: SWAP_TYPES
    exchangeRateInfo?: {
      pair: string
      exchangeRate: BigNumber
      priceImpact: BigNumber
    }
  }
}

function ReviewVirtualSwapSettlement({
  onClose,
  onConfirm,
  data,
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
  const [hasConfirmedHighPriceImpact, setHasConfirmedHighPriceImpact] =
    useState(false)
  const fromToken = TOKENS_MAP[data.from.symbol]
  const toToken = data.to ? TOKENS_MAP[data.to.symbol] : null
  const isHighPriceImpactTxn = Boolean(
    data.to?.value &&
      data.exchangeRateInfo &&
      isHighPriceImpact(data.exchangeRateInfo.priceImpact),
  )
  const deadline = formatDeadlineToNumber(
    transactionDeadlineSelected,
    transactionDeadlineCustom,
  )
  // const gasPrice = gasBNFromState(
  //   { gasStandard, gasFast, gasInstant },
  //   gasPriceSelected,
  //   gasCustom,
  // )
  // const gasAmount = calculateGasEstimate("virtualSwapSettleOrWithdraw").mul(
  //   gasPrice,
  // )
  // const gasValueUSD = tokenPricesUSD?.ETH
  //   ? parseUnits(tokenPricesUSD.ETH.toFixed(2), 18) // USD / ETH  * 10^18
  //       .mul(gasAmount) // GWEI
  //       .div(BigNumber.from(10).pow(25)) // USD / ETH * GWEI * ETH / GWEI = USD
  //   : null
  const shouldDisplayGas = !!gasStandard
  const isWithdrawAction = !data.from
  return (
    <div className="reviewSwap">
      <h3>
        {isWithdrawAction ? t("Review Withdraw") : t("Review Settlement")}
      </h3>
      <div className="swapTable">
        <div className="from">
          <img className="tokenIcon" src={fromToken.icon} alt="icon" />
          <span className="tokenName">{data.from.symbol}</span>
          <div className="floatRight">
            <span>{commify(data.from.value)}</span>
          </div>
        </div>

        {data.to && (
          <>
            <ThinArrowDown className="stepArrow" />
            <div className="to">
              <img className="tokenIcon" src={toToken?.icon} alt="icon" />
              <span className="tokenName">{data.to.symbol}</span>
              <div className="floatRight">
                <span>{commify(data.to.value)}</span>
              </div>
            </div>
          </>
        )}

        <div className="divider" style={{ height: "1px", width: "100%" }} />
        <div className="swapInfo">
          {data.exchangeRateInfo && (
            <div className="priceTable">
              <span className="title">{t("exchangeRate")}</span>{" "}
              <span className="pair">{data.exchangeRateInfo.pair}</span>
              <span className="value floatRight">
                {formatBNToString(data.exchangeRateInfo.exchangeRate, 18, 4)}
              </span>
            </div>
          )}

          {shouldDisplayGas && (
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
          )}
          {/* TODO: Create a light API to expose the cached BlockNative gas estimates. */}
          {/* {gasValueUSD && (
            <div className="row">
              <span className="title">{t("estimatedTxCost")}</span> 
              <span className="value floatRight">
                {`≈$${commify(formatBNToString(gasValueUSD, 2, 2))}`}
              </span>
            </div>
          )} */}
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

export default ReviewVirtualSwapSettlement
