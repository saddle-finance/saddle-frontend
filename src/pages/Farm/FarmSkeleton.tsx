import { Box, Container, Skeleton } from "@mui/material"
import React from "react"

export default function FarmSkeleton() {
  return (
    <Container sx={{ pb: 5 }}>
      {Array(10)
        .fill("")
        .map((item, index) => (
          <Box
            key={`skeleton-${index}`}
            padding="8px 24px "
            sx={{
              border: (theme) => `${theme.palette.other.divider} solid 1px`,
            }}
          >
            <Skeleton height={64} width={926} />
          </Box>
        ))}
    </Container>
  )
}
