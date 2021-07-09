import "./ReviewMigration.scss"

import React, { ReactElement } from "react"
import { commify, formatBNToString } from "../utils"

import { AppState } from "../state/index"
import { BigNumber } from "@ethersproject/bignumber"
import Button from "./Button"
import Warning from "./Warning"
import { formatGasToString } from "../utils/gas"
import { formatSlippageToString } from "../utils/slippage"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  onClose?: () => void
  onConfirm?: () => void
  data: {
    migrateAmount: {
      amount: number
    }
    txnGasCost: {
      amount: number
      valueUSD: BigNumber | null // amount * ethPriceUSD
    }
  }
}

function ReviewMigration({ onClose, onConfirm, data }: Props): ReactElement {
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
    <div className="reviewMigration">
      <h3>{t("reviewMigration")}</h3>
      <div className="migrateTop">
        <Warning>{t("migrationExplain")}</Warning>
        <div className="info">
          <div className="row">
            <span className="title">{t("migrationAmount")}</span>
            <span className="value floatRight">
              {data.migrateAmount.amount} saddleUSD
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
        </div>
      </div>
      <div className="bottom">
        <p>{t("estimatedOutput")}</p>
        <div className="buttonWrapper">
          <Button onClick={onConfirm} kind="temporary">
            {t("confirmMigrate")}
          </Button>
          <Button onClick={onClose} kind="cancel">
            {t("cancel")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ReviewMigration
