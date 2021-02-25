import "./SlippageField.scss"

import React, { ReactElement } from "react"
import {
  Slippages,
  updateSlippageCustom,
  updateSlippageSelected,
} from "../state/user"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state/index"
import { PayloadAction } from "@reduxjs/toolkit"
import classNames from "classnames"
import { useTranslation } from "react-i18next"

export default function SlippageField(): ReactElement {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { slippageCustom, slippageSelected } = useSelector(
    (state: AppState) => state.user,
  )
  return (
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
  )
}
