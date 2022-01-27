import "./ReviewMigration.scss"

import React, { ReactElement } from "react"
import { commify, formatBNToString } from "../utils"

import { AppState } from "../state/index"
import { BigNumber } from "@ethersproject/bignumber"
import Button from "./Button"
import Warning from "./Warning"
import { gasBNFromState } from "../utils/gas"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  onClose?: () => void
  onConfirm?: () => void
  migrationAmount?: BigNumber // 1e18
  lpTokenName?: string
}

function ReviewMigration({
  onClose,
  onConfirm,
  migrationAmount,
  lpTokenName,
}: Props): ReactElement {
  const { t } = useTranslation()
  const { gasPriceSelected, gasCustom } = useSelector(
    (state: AppState) => state.user,
  )
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const gasPrice = gasBNFromState(
    { gasStandard, gasFast, gasInstant },
    gasPriceSelected,
    gasCustom,
  )
  // const gasAmount = calculateGasEstimate("migrate").mul(gasPrice)
  // const gasValueUSD = tokenPricesUSD?.ETH
  //   ? parseUnits(tokenPricesUSD.ETH.toFixed(2), 18) // USD / ETH  * 10^18
  //       .mul(gasAmount) // GWEI
  //       .div(BigNumber.from(10).pow(25)) // USD / ETH * GWEI * ETH / GWEI = USD
  //   : null
  const shouldDisplayGas = !!gasStandard

  return (
    <div className="reviewMigration">
      <h3>{t("reviewMigration")}</h3>
      <div className="migrateTop">
        <Warning>{t("migrationExplain")}</Warning>
        <div className="info">
          <div className="row">
            <span className="title">{t("migrationAmount")}</span>
            <span className="value floatRight">
              {commify(
                formatBNToString(migrationAmount || BigNumber.from("0"), 18, 2),
              )}{" "}
              {lpTokenName}
            </span>
          </div>
          {shouldDisplayGas && (
            <div className="row">
              <span className="title">{t("gas")}</span>
              <span className="value floatRight">
                {gasPrice.toString()} GWEI
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
            <span className="value floatRight">0.5%</span>
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
