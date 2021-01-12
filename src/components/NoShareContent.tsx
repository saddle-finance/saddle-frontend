import "./NoShareContent.scss"

import React, { ReactElement } from "react"

import depositGraph from "../assets/deposit_graph.svg"
import { useTranslation } from "react-i18next"

function NoShareContent(): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="no-share">
      <img src={depositGraph} alt="put tokens in pool" />
      <h2>
        {t("noDepositTitle")}
        <br />
        {t("noDepositTitle2")}
      </h2>
      <p>{t("noDeposit2")}</p>
      <a href="/#/deposit">
        <button className="actionBtn">{t("deposit")}</button>
      </a>
    </div>
  )
}

export default NoShareContent
