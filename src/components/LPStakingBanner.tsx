import { Alert, Link, Typography } from "@mui/material"
import React, { ReactElement } from "react"

import { useTranslation } from "react-i18next"

interface Props {
  stakingLink: string
}

function LPStakingBanner({ stakingLink }: Props): ReactElement {
  const { t } = useTranslation()

  return (
    <Alert icon={false} sx={{ mb: 2 }}>
      <Typography>
        {t("lpMustStakeForRewards")} &lt;
        <Link href={stakingLink} target="_blank" rel="noopener noreferrer">
          {t("stakeHere")}
        </Link>
        &gt;
      </Typography>
    </Alert>
  )
}

export default LPStakingBanner
