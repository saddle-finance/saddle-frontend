import "./ConfirmTransaction.scss"

import React, { ReactElement } from "react"

import signImg from "../assets/icons/icon_sign.svg"
import { useTranslation } from "react-i18next"

function ConfirmTransaction(): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="confirmTransaction">
      <h3>{t("confirmTransaction")}</h3>
      <img src={signImg} alt="confirm in wallet" />
    </div>
  )
}

export default ConfirmTransaction
