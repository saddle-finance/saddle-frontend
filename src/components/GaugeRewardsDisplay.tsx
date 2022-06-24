import { Box, Typography } from "@mui/material"
import React, { ReactElement } from "react"
import { commify, formatBNToPercentString, formatBNToString } from "../utils"

import { GaugeApr } from "../providers/AprsProvider"

export default function GaugeRewardsDisplay({
  aprs: gaugeAprs,
}: {
  aprs?: GaugeApr[] | null
}): ReactElement | null {
  if (!gaugeAprs) return null
  return (
    <>
      {gaugeAprs.map((aprData) => {
        if (!aprData.rewardToken) return null
        const { symbol, address } = aprData.rewardToken
        if (aprData.amountPerDay) {
          const { min, max } = aprData.amountPerDay
          if (max.isZero()) return null
          return (
            <Box key={address}>
              <Typography component="p">{symbol}/24h:</Typography>
              <Typography component="span" variant="subtitle1">
                {`${commify(formatBNToString(min, 18, 0))}-${commify(
                  formatBNToString(max, 18, 0),
                )}`}
              </Typography>
            </Box>
          )
        } else if (aprData.apr) {
          const { min, max } = aprData.apr
          if (max.isZero()) return null
          return (
            <Box key={address}>
              <Typography component="p">{symbol} apr:</Typography>
              <Typography component="span" variant="subtitle1">
                {`${formatBNToPercentString(
                  min,
                  18,
                  2,
                )}-${formatBNToPercentString(max, 18, 2)}`}
              </Typography>
            </Box>
          )
        }
      })}
    </>
  )
}
