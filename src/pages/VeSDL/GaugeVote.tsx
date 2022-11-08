import { Box, Paper, Skeleton, Typography } from "@mui/material"
import React, { useContext } from "react"

import { BigNumber } from "ethers"
import { GaugeContext } from "../../providers/GaugeProvider"
import GaugeWeight from "../../components/GaugeWeight"
import { IS_ON_CHAIN_VOTE_LIVE } from "../../constants"
import OnChainVote from "./OnChainVote"
import { useGaugeControllerContract } from "../../hooks/useContract"
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
  const gaugeControllerContract = useGaugeControllerContract()
  return (
    <Paper sx={{ pt: 2 }}>
      <Typography variant="h2" textAlign="center">
        {t("gaugeVote")}
      </Typography>
      <Box height="428px">
        <GaugeWeight />
      </Box>
      {!isGaugesLoading &&
      gaugeControllerContract?.signer &&
      IS_ON_CHAIN_VOTE_LIVE ? (
        <OnChainVote
          veSdlBalance={veSdlBalance}
          gauges={gauges}
          gaugeControllerContract={gaugeControllerContract}
        />
      ) : (
        <Skeleton height={100} sx={{ mx: 3, flex: 1 }} />
      )}
    </Paper>
  )
}
