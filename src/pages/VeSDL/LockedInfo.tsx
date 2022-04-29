import { Box, Paper, Typography } from "@mui/material"
import React from "react"
import { useTranslation } from "react-i18next"

type LockedInfoProps = {
  sdlLocked?: string
  totalveSdl?: string
  avgLockTime?: string
}

export default function LockedInfo({
  sdlLocked,
  totalveSdl,
  avgLockTime,
}: LockedInfoProps): JSX.Element {
  const { t } = useTranslation()
  return (
    <Paper sx={{ display: "flex", p: 2 }}>
      <Box flex={1}>
        <Typography>{t("sdlLocked")}</Typography>
        <Typography variant="subtitle1">{sdlLocked || "-"}</Typography>
      </Box>
      <Box flex={1}>
        <Typography>{t("totalVeSDL")}</Typography>
        <Typography variant="subtitle1">{totalveSdl || "-"}</Typography>
      </Box>
      <Box flex={1}>
        <Typography>{t("avgLockTime")}</Typography>
        <Typography variant="subtitle1">{avgLockTime || "-"}</Typography>
      </Box>
    </Paper>
  )
}
