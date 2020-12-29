import "./NoShareContent.scss"

import React, { ReactElement } from "react"

import depositGraph from "../assets/deposit_graph.png"
import { useTranslation } from "react-i18next"

function NoShareContent(): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="no-share">
      <p>
        {t("noDeposit")} <a href="/#/deposit">{t("deposit")}</a>{" "}
        {t("noDeposit2")}
      </p>
      {/* TODO: update placeholder graph below */}
      <img src={depositGraph} alt="put tokens in pool" />
    </div>
  )
}

export default NoShareContent
