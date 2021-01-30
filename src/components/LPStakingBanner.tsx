import "./LPStakingBanner.scss"

import React, { ReactElement } from "react"

import { useTranslation } from "react-i18next"

function LPStakingBanner(): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="lpStakingBanner">
      <p>
        {t("lpMustStakeForRewards")} &lt;
        <a
          href="https://dashboard.keep.network/liquidity"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("stakeHere")}
        </a>
        &gt;
      </p>
    </div>
  )
}

export default LPStakingBanner
