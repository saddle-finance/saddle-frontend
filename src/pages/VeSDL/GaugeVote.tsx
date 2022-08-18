import { Box, Paper, Skeleton, Typography } from "@mui/material"
import React, { useContext } from "react"

import { BigNumber } from "ethers"
import { GaugeContext } from "../../providers/GaugeProvider"
import GaugeWeight from "../../components/GaugeWeight"
import OnChainVote from "./OnChainVote"
import { useTranslation } from "react-i18next"

interface GaugeVoteProps {
  veSdlBalance: BigNumber
}
export default function GaugeVote({
  veSdlBalance,
}: GaugeVoteProps): JSX.Element {
  const { t } = useTranslation()
  const { gauges } = useContext(GaugeContext)
  const isGaugesLoading = Object.keys(gauges).length === 0
  return (
    <Paper sx={{ pt: 2 }}>
      <Typography variant="h2" textAlign="center">
        {t("gaugeVote")}
      </Typography>
      <Box height="428px">
        <GaugeWeight />
      </Box>
      {!isGaugesLoading ? (
        <OnChainVote veSdlBalance={veSdlBalance} gauges={gauges} />
      ) : (
        <Skeleton width="100%" height={100} />
      )}
    </Paper>
  )
}
