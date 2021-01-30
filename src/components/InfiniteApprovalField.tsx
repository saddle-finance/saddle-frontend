import "./InfiniteApprovalField.scss"

import React, { ReactElement } from "react"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state/index"
import CheckboxInput from "./CheckboxInput"
import { PayloadAction } from "@reduxjs/toolkit"
import { updateInfiniteApproval } from "../state/user"
import { useTranslation } from "react-i18next"

export default function InfiniteApprovalField(): ReactElement {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { infiniteApproval } = useSelector((state: AppState) => state.user)
  return (
    <div className="infiniteApproval">
      <div className="label">
        {t("infiniteApproval")}
        <span className="tooltipText">{t("infiniteApprovalTooltip")}</span>
      </div>
      <CheckboxInput
        checked={infiniteApproval}
        onChange={(): PayloadAction<boolean> =>
          dispatch(updateInfiniteApproval(!infiniteApproval))
        }
      />
    </div>
  )
}
