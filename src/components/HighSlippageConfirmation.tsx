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
      {t(
        "Warning: This transaction's slippage exceeds 10% which will result in a loss of funds. Please confirm that you understand before submitting your transaction.",
      )}
      <div className="confirmationBox">
        <span>{t("I CONFIRM")}</span>{" "}
        <CheckboxInput checked={checked} onChange={onCheck} />
      </div>
    </div>
  )
}
