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
      <span className="label">{t("maxSlippage")}</span>
      <div className="options">
        <button
          className={classNames({
            selected: slippageSelected === Slippages.OneTenth,
          })}
          onClick={(): PayloadAction<Slippages> =>
            dispatch(updateSlippageSelected(Slippages.OneTenth))
          }
        >
          0.1%
        </button>
        <button
          className={classNames({
            selected: slippageSelected === Slippages.One,
          })}
          onClick={(): PayloadAction<Slippages> =>
            dispatch(updateSlippageSelected(Slippages.One))
          }
        >
          1%
        </button>
        <input
          value={slippageCustom?.valueRaw}
          onClick={(): PayloadAction<Slippages> =>
            dispatch(updateSlippageSelected(Slippages.Custom))
          }
          onChange={(e): PayloadAction<string> =>
            dispatch(updateSlippageCustom(e.target.value))
          }
        />
        &nbsp;%
      </div>
    </div>
  )
}
