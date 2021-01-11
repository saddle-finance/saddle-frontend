import "./IneligibilityBanner.scss"

import React, { ReactElement } from "react"

import { useTranslation } from "react-i18next"

function Eligibility(): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="eligibility">
      <p>
        {t("notEligible")} &lt;
        <a
          href="https://docs.saddle.finance/faq#what-is-saddles-guarded-launch-proof-of-governance-who-can-participate"
          target="_blank"
          rel="noreferrer"
        >
          {t("learnMore")}
        </a>
        &gt;
      </p>
    </div>
  )
}

export default Eligibility
