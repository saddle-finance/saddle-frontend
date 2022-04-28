import { Box, Paper, Typography } from "@mui/material"
import React from "react"

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
  return (
    <Paper sx={{ display: "flex", p: 2 }}>
      <Box flex={1}>
        <Typography>SDL locked</Typography>
        <Typography variant="subtitle1">{sdlLocked || "-"}</Typography>
      </Box>
      <Box flex={1}>
        <Typography>Total veSDL</Typography>
        <Typography variant="subtitle1">{totalveSdl || "-"}</Typography>
      </Box>
      <Box flex={1}>
        <Typography>Avg. lock time</Typography>
        <Typography variant="subtitle1">{avgLockTime || "-"}</Typography>
      </Box>
    </Paper>
  )
}
