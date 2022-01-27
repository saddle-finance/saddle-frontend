import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material"
import { Deadlines, GasPrices, Slippages } from "../state/user"
import React, { ReactElement } from "react"
import {
  updateGasPriceCustom,
  updateGasPriceSelected,
  updateInfiniteApproval,
  updatePoolAdvancedMode,
  updateSlippageCustom,
  updateSlippageSelected,
  updateTransactionDeadlineCustom,
  updateTransactionDeadlineSelected,
} from "../state/user"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state/index"
import { ExpandMore } from "@mui/icons-material"
import { PayloadAction } from "@reduxjs/toolkit"
import classNames from "classnames"
import styles from "./AdvancedOptions.module.scss"
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
    userPoolAdvancedMode: advanced,
  } = useSelector((state: AppState) => state.user)

  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )

  const handleSlippage = (
    event: React.MouseEvent<HTMLElement>,
    slippageValue: Slippages,
  ) => {
    console.log("slippage value =>", slippageValue)
    dispatch(updateSlippageSelected(slippageValue))
  }
  return (
    <div data-testid="advOptionContainer" className={styles.advancedOptions}>
      <Accordion
        data-testid="advOptionTitle"
        onChange={(): PayloadAction<boolean> =>
          dispatch(updatePoolAdvancedMode(!advanced))
        }
        expanded={advanced}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography color="primary" variant="subtitle1">
            {t("advancedOptions")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div data-testid="advTableContainer">
            <Box display="flex" data-testid="infiniteApprovalContainer">
              <Checkbox
                checked={infiniteApproval}
                onChange={(): PayloadAction<boolean> =>
                  dispatch(updateInfiniteApproval(!infiniteApproval))
                }
              />
              <Tooltip
                title={
                  <React.Fragment>
                    {t("infiniteApprovalTooltip")}
                  </React.Fragment>
                }
                placement="top"
              >
                <Typography variant="body1">{t("infiniteApproval")}</Typography>
              </Tooltip>
            </Box>

            <div className={styles.parameter}>
              <div
                data-testid="maxSlippageInputGroup"
                className={styles.inputGroup}
              >
                <Typography variant="body1">{t("maxSlippage")}: </Typography>
                <ToggleButtonGroup
                  size="small"
                  fullWidth
                  exclusive
                  value={slippageSelected}
                  onChange={handleSlippage}
                >
                  <ToggleButton
                    value={Slippages.OneTenth}
                    selected={slippageSelected === Slippages.OneTenth}
                  >
                    0.1%
                  </ToggleButton>
                  <ToggleButton value={Slippages.One}>1%</ToggleButton>
                  <ToggleButton value={Slippages.Custom}>5%</ToggleButton>
                </ToggleButtonGroup>
                <div>
                  <input
                    value={slippageCustom?.valueRaw}
                    onChange={(
                      e: React.ChangeEvent<HTMLInputElement>,
                    ): void => {
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
            <div className={styles.parameter}>
              <div
                data-testid="txnDeadlineInputGroup"
                className={styles.inputGroup}
              >
                <div className={styles.options}>
                  <Typography variant="body1">{t("deadline")}: </Typography>
                  <button
                    className={classNames({
                      [styles.selected]:
                        transactionDeadlineSelected === Deadlines.Twenty,
                    })}
                    onClick={(): void => {
                      dispatch(
                        updateTransactionDeadlineSelected(Deadlines.Twenty),
                      )
                    }}
                  >
                    <span>20 {t("minutes")}</span>
                  </button>
                  <button
                    className={classNames({
                      [styles.selected]:
                        transactionDeadlineSelected === Deadlines.Forty,
                    })}
                    onClick={(): void => {
                      dispatch(
                        updateTransactionDeadlineSelected(Deadlines.Forty),
                      )
                    }}
                  >
                    <span>40 {t("minutes")}</span>
                  </button>
                  <div>
                    <input
                      type="text"
                      className={classNames({
                        [styles.selected]:
                          transactionDeadlineSelected === Deadlines.Custom,
                      })}
                      placeholder="20"
                      onClick={(): PayloadAction<Deadlines> =>
                        dispatch(
                          updateTransactionDeadlineSelected(Deadlines.Custom),
                        )
                      }
                      value={transactionDeadlineCustom}
                      onChange={(
                        e: React.ChangeEvent<HTMLInputElement>,
                      ): void => {
                        const value = e.target.value
                        if (value && !isNaN(+value)) {
                          dispatch(updateTransactionDeadlineCustom(value))
                          if (
                            transactionDeadlineSelected !== Deadlines.Custom
                          ) {
                            dispatch(
                              updateTransactionDeadlineSelected(
                                Deadlines.Custom,
                              ),
                            )
                          }
                        } else {
                          dispatch(
                            updateTransactionDeadlineSelected(Deadlines.Twenty),
                          )
                        }
                      }}
                    />
                    &nbsp;{t("minutes")}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.parameter} style={{ display: "none" }}>
              <div className={styles.inputGroup}>
                <div className={styles.options}>
                  <div className={styles.label}>{t("gas")}:</div>
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
                            [styles.selected]:
                              gasPriceSelected === gasPriceConst,
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
                      [styles.selected]: gasPriceSelected === GasPrices.Custom,
                    })}
                    value={gasCustom?.valueRaw}
                    onChange={(
                      e: React.ChangeEvent<HTMLInputElement>,
                    ): void => {
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
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}
