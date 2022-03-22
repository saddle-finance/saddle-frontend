import { Box, Typography } from "@mui/material"
import React, { ReactElement } from "react"

function Version(): ReactElement | null {
  return (
    <Box
      position={{ lg: "fixed" }}
      display={{ xs: "none", lg: "block" }}
      bottom={24}
      left={56}
    >
      <Typography variant="body2">
        VERSION {process.env.REACT_APP_GIT_SHA}
      </Typography>
    </Box>
  )
}

export default Version
