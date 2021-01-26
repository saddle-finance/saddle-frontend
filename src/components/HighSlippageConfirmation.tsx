import "./HighSlippageConfirmation.scss"

import React, { ReactElement } from "react"

import CheckboxInput from "./CheckboxInput"
import { useTranslation } from "react-i18next"

interface Props {
  checked: boolean
  onCheck: () => void
}
export default function HighSlippageConfirmation({
  checked,
  onCheck,
}: Props): ReactElement {
  const { t } = useTranslation()
  return (
    <div className="highSlippageConfirmation">
      {t("highSlippageConfirmation")}
      <div className="confirmationBox">
        <span>{t("I CONFIRM")}</span>{" "}
        <CheckboxInput checked={checked} onChange={onCheck} />
      </div>
    </div>
  )
}
