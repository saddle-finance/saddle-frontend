import "./IneligibilityBanner.scss"

import React, { ReactElement } from "react"

import { useTranslation } from "react-i18next"

function Eligibility(): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="eligibility">
      <p>
        {t("notEligible")} &lt;<a href="#top">{t("learnMore")}</a>&gt;
      </p>
      {/* TODO: Add related article link */}
    </div>
  )
}

export default Eligibility
