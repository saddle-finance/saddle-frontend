import { Box, Paper, Typography } from "@mui/material"

import GaugeWeight from "../../components/GaugeWeight"
import OnChainVote from "./OnChainVote"
import React from "react"
import { useTranslation } from "react-i18next"

interface GaugeVoteProps {
  veSdlBalance: string
}
export default function GaugeVote({
  veSdlBalance,
}: GaugeVoteProps): JSX.Element {
  const { t } = useTranslation()
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h2" textAlign="center">
        {t("gaugeVote")}
      </Typography>
      <Box height="428px">
        <GaugeWeight />
      </Box>
      <OnChainVote veSdlBalance={veSdlBalance} />
    </Paper>
  )
}
