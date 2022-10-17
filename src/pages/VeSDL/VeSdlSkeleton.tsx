import { Box, Container, Skeleton } from "@mui/material"
import React from "react"

export default function VeSdlSkeleton() {
  return (
    <Container>
      <Box display="flex" gap="16px">
        <Box>
          <Skeleton width={480} height={710} sx={{ mb: "16px" }} />
          <Skeleton width={480} height={156} />
        </Box>
        <Box>
          <Skeleton width={480} height={74} sx={{ mb: "16px" }} />
          <Skeleton width={480} height={920} />
        </Box>
      </Box>
    </Container>
  )
}
