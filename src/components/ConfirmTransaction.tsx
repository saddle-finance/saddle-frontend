import "./ConfirmTransaction.scss"

import React, { ReactElement } from "react"

import signImg from "../assets/icons/image_sign.svg"
import { useTranslation } from "react-i18next"

function ConfirmTransaction(): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="confirmTransaction">
      <img src={signImg} alt="confirm in wallet" />
      <h3>{t("confirmTransaction")}</h3>
    </div>
  )
}

export default ConfirmTransaction
