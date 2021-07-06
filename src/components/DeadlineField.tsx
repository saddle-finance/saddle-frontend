import "./DeadlineField.scss"

import React, { ReactElement } from "react"
import {
  updateTransactionDeadlineCustom,
  updateTransactionDeadlineSelected,
} from "../state/user"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state/index"
import { Deadlines } from "../state/user"
import { PayloadAction } from "@reduxjs/toolkit"
import classNames from "classnames"
import { useTranslation } from "react-i18next"

export default function DeadlineField(): ReactElement {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()

  const {
    transactionDeadlineSelected,
    transactionDeadlineCustom,
  } = useSelector((state: AppState) => state.user)
  return (
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
                dispatch(updateTransactionDeadlineSelected(Deadlines.Custom))
              }
            } else {
              dispatch(updateTransactionDeadlineSelected(Deadlines.Twenty))
            }
          }}
        />
        &nbsp;{t("minutes")}
      </div>
    </div>
  )
}
