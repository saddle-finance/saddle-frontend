import "./DeadlineField.scss"

import React, { ReactElement } from "react"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state/index"
import { Deadlines } from "../state/user"
import { PayloadAction } from "@reduxjs/toolkit"

import classNames from "classnames"
import { updateTransactionDeadline } from "../state/user"
import { useTranslation } from "react-i18next"

export default function DeadlineField(): ReactElement {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()

  const { transactionDeadline } = useSelector((state: AppState) => state.user)
  return (
    <div className="deadlineField">
      <div className="options">
        <div className="label">{t("deadline")}: </div>
        <button
          className={classNames({
            selected: transactionDeadline === Deadlines.Ten,
          })}
          onClick={(): void => {
            dispatch(updateTransactionDeadline(Deadlines.Ten))
          }}
        >
          <span>10 {t("minutes")}</span>
        </button>
        <button
          className={classNames({
            selected: transactionDeadline === Deadlines.Thirty,
          })}
          onClick={(): void => {
            dispatch(updateTransactionDeadline(Deadlines.Thirty))
          }}
        >
          <span>30 {t("minutes")}</span>
        </button>
        <input
          type="text"
          className={classNames({
            selected: transactionDeadline === Deadlines.Custom,
          })}
          placeholder="10"
          onClick={(): PayloadAction<Deadlines> =>
            dispatch(updateTransactionDeadline(Deadlines.Custom))
          }
          onChange={(e): void => {
            let deadlineNumber =
              e.target.value === "" || parseFloat(e.target.value) < 0
              ? Deadlines.Ten // if left blank, deadline defaults to 10
              : parseFloat(e.target.value)
            dispatch(updateTransactionDeadline(deadlineNumber))
          }}
        />
        <span> {t("minutes")}</span>
      </div>
    </div>
  )
}
