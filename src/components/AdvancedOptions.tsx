import "./AdvancedOptions.scss"

import { Deadlines, GasPrices, Slippages } from "../state/user"

import React, { ReactElement } from "react"
import {
  updateGasPriceCustom,
  updateGasPriceSelected,
  updateInfiniteApproval,
  updateSlippageCustom,
  updateSlippageSelected,
  updateTransactionDeadlineCustom,
  updateTransactionDeadlineSelected,
} from "../state/user"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state/index"
import CheckboxInput from "./CheckboxInput"
import { PayloadAction } from "@reduxjs/toolkit"
import ToolTip from "./ToolTip"
import classNames from "classnames"

import { useTranslation } from "react-i18next"

export default function AdvancedOptions(): ReactElement {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const {
    infiniteApproval,
    slippageCustom,
    slippageSelected,
    transactionDeadlineSelected,
    transactionDeadlineCustom,
    gasCustom,
    gasPriceSelected,
  } = useSelector((state: AppState) => state.user)

  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )

  return (
    <>
      <div className="parameter">
        <div className="infiniteApproval">
          <CheckboxInput
            checked={infiniteApproval}
            onChange={(): PayloadAction<boolean> =>
              dispatch(updateInfiniteApproval(!infiniteApproval))
            }
          />
          <ToolTip content={t("infiniteApprovalTooltip")}>
            <span className="label">{t("infiniteApproval")}</span>
          </ToolTip>
        </div>
      </div>
      <div className="parameter">
        <div className="slippageField">
          <div className="options">
            <div className="label">{t("maxSlippage")}: </div>
            <button
              className={classNames({
                selected: slippageSelected === Slippages.OneTenth,
              })}
              onClick={(): PayloadAction<Slippages> =>
                dispatch(updateSlippageSelected(Slippages.OneTenth))
              }
            >
              <span>0.1%</span>
            </button>
            <button
              className={classNames({
                selected: slippageSelected === Slippages.One,
              })}
              onClick={(): PayloadAction<Slippages> =>
                dispatch(updateSlippageSelected(Slippages.One))
              }
            >
              <span>1%</span>
            </button>
            <input
              value={slippageCustom?.valueRaw}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                const value = e.target.value
                if (value && !isNaN(+value)) {
                  dispatch(updateSlippageCustom(value))
                  if (slippageSelected !== Slippages.Custom) {
                    dispatch(updateSlippageSelected(Slippages.Custom))
                  }
                } else {
                  dispatch(updateSlippageSelected(Slippages.OneTenth))
                }
              }}
            />
            &nbsp;%
          </div>
        </div>
      </div>
      <div className="parameter">
        <div className="deadlineField">
          <div className="options">
            <div className="label">{t("deadline")}: </div>
            <button
              className={classNames({
                selected: transactionDeadlineSelected === Deadlines.Twenty,
              })}
              onClick={(): void => {
                dispatch(updateTransactionDeadlineSelected(Deadlines.Twenty))
              }}
            >
              <span>20 {t("minutes")}</span>
            </button>
            <button
              className={classNames({
                selected: transactionDeadlineSelected === Deadlines.Forty,
              })}
              onClick={(): void => {
                dispatch(updateTransactionDeadlineSelected(Deadlines.Forty))
              }}
            >
              <span>40 {t("minutes")}</span>
            </button>
            <input
              type="text"
              className={classNames({
                selected: transactionDeadlineSelected === Deadlines.Custom,
              })}
              placeholder="20"
              onClick={(): PayloadAction<Deadlines> =>
                dispatch(updateTransactionDeadlineSelected(Deadlines.Custom))
              }
              value={transactionDeadlineCustom}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                const value = e.target.value
                if (value && !isNaN(+value)) {
                  dispatch(updateTransactionDeadlineCustom(value))
                  if (transactionDeadlineSelected !== Deadlines.Custom) {
                    dispatch(
                      updateTransactionDeadlineSelected(Deadlines.Custom),
                    )
                  }
                } else {
                  dispatch(updateTransactionDeadlineSelected(Deadlines.Twenty))
                }
              }}
            />
            &nbsp;{t("minutes")}
          </div>
        </div>
      </div>
      <div className="parameter">
        <div className="gasField">
          <div className="options">
            <div className="label">{t("gas")}:</div>
            {[GasPrices.Standard, GasPrices.Fast, GasPrices.Instant].map(
              (gasPriceConst) => {
                let priceValue
                let text
                if (gasPriceConst === GasPrices.Standard) {
                  priceValue = gasStandard
                  text = t("standard")
                } else if (gasPriceConst === GasPrices.Fast) {
                  priceValue = gasFast
                  text = t("fast")
                } else {
                  priceValue = gasInstant
                  text = t("instant")
                }

                return (
                  <button
                    key={gasPriceConst}
                    className={classNames({
                      selected: gasPriceSelected === gasPriceConst,
                    })}
                    onClick={(): PayloadAction<GasPrices> =>
                      dispatch(updateGasPriceSelected(gasPriceConst))
                    }
                  >
                    <div>
                      <div>{priceValue}</div>
                      <div>{text}</div>
                    </div>
                  </button>
                )
              },
            )}
            <input
              type="text"
              className={classNames({
                selected: gasPriceSelected === GasPrices.Custom,
              })}
              value={gasCustom?.valueRaw}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                const value = e.target.value
                if (value && !isNaN(+value)) {
                  dispatch(updateGasPriceCustom(value))
                  if (gasPriceSelected !== GasPrices.Custom) {
                    dispatch(updateGasPriceSelected(GasPrices.Custom))
                  }
                } else {
                  dispatch(updateGasPriceSelected(GasPrices.Fast))
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
