import { Box, Container, Skeleton, Typography } from "@mui/material"
import React from "react"

export default function RiskSkeleton() {
  return (
    <Container maxWidth="md">
      {Array(5)
        .fill("")
        .map((_, index) => (
          <Box key={`skeleton-${index}`}>
            <Typography variant="h3" sx={{ mb: "16px" }}>
              <Skeleton width={200} />
            </Typography>
            <Skeleton height={100} width={720} sx={{ mb: "24px" }} />
          </Box>
        ))}
    </Container>
  )
}
