import "./HighPriceImpactConfirmation.scss"

import React, { ReactElement } from "react"

import { Checkbox } from "@mui/material"
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
        <Checkbox checked={checked} onChange={onCheck} />
      </div>
    </div>
  )
}
