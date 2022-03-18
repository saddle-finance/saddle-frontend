import { Box, Checkbox, Typography } from "@mui/material"
import React, { ReactElement } from "react"

import { useTranslation } from "react-i18next"

interface Props {
  checked: boolean
  onCheck: () => void
}
export default function HighPriceImpactConfirmation({
  checked,
  onCheck,
}: Props): ReactElement {
  const { t } = useTranslation()
  return (
    <Box bgcolor="error.main" p={2}>
      {t("highPriceImpactConfirmation")}
      <Box mt={2}>
        <Typography component="span" mr={1}>
          {t("iConfirm")}
        </Typography>
        <Checkbox checked={checked} onChange={onCheck} />
      </Box>
    </Box>
  )
}
