import "./HighPriceImpactConfirmation.scss"

import React, { ReactElement } from "react"

import CheckboxInput from "./CheckboxInput"
import { useTranslation } from "react-i18next"

interface Props {
  checked: boolean
  onCheck: () => void
}
export default function HighPriceImpactConfirmation({
  checked,
  onCheck,
}: Props): ReactElement {
  const { t } = useTranslation()
  return (
    <div className="highPriceImpactConfirmation">
      {t("highPriceImpactConfirmation")}
      <div className="confirmationBox">
        <span>{t("iConfirm")}</span>{" "}
        <CheckboxInput checked={checked} onChange={onCheck} />
      </div>
    </div>
  )
}
