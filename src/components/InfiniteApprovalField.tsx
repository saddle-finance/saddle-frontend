import "./InfiniteApprovalField.scss"

import React, { ReactElement } from "react"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state/index"
import { PayloadAction } from "@reduxjs/toolkit"
import { updateInfiniteApproval } from "../state/user"
import { useTranslation } from "react-i18next"

export default function InfintiteApprovalField(): ReactElement {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { infiniteApproval } = useSelector((state: AppState) => state.user)
  return (
    <div className="infiniteApproval">
      <div className="label">
        {t("infiniteApproval")}
        <span className="tooltipText">
          Allow Saddle to spend all of the selected tokens now and in the
          future. You will not need to approve again.
        </span>
      </div>
      <label className="checkbox_input">
        <input
          type="checkbox"
          checked={infiniteApproval}
          onChange={(): PayloadAction<boolean> =>
            dispatch(updateInfiniteApproval(!infiniteApproval))
          }
        />
        <span className="checkbox_control">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="none"
              strokeWidth="4"
              d="M1.73 12.91l6.37 6.37L22.79 4.59"
            />
          </svg>
        </span>
      </label>
    </div>
  )
}
