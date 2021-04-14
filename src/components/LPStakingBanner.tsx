import "./LPStakingBanner.scss"

import React, { ReactElement } from "react"

import { useTranslation } from "react-i18next"

interface Props {
  stakingLink: string
}

function LPStakingBanner({ stakingLink }: Props): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="lpStakingBanner">
      <p>
        {t("lpMustStakeForRewards")} &lt;
        <a href={stakingLink} target="_blank" rel="noopener noreferrer">
          {t("stakeHere")}
        </a>
        &gt;
      </p>
    </div>
  )
}

export default LPStakingBanner
