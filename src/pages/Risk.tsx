import React, { ReactElement } from "react"

import TopMenu from "../components/TopMenu"
import { useTranslation } from "react-i18next"

function Risk(): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="riskpage">
      <TopMenu activeTab={t("risk")} />
      <h1> This is the risk page </h1>
    </div>
  )
}

export default Risk
