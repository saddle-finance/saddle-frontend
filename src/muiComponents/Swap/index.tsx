import { Box, Paper, TextField, Typography } from "@mui/material"
import React, { ReactElement } from "react"

interface Props {
  inputValue?: number
}

export default function SwapPage({ inputValue }: Props): ReactElement {
  return (
    <Box>
      <Paper>
        Swap
        <Box display="flex">
          <Typography>From</Typography>
          <Typography>Balance:{inputValue}</Typography>
          <TextField variant="outlined" />
        </Box>
        <Typography>To</Typography>
      </Paper>
    </Box>
  )
}
