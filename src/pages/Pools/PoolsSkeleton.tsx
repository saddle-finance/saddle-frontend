import { Container, Skeleton } from "@mui/material"
import React from "react"

export default function PoolsSkeleton() {
  return (
    <Container sx={{ pb: 5 }}>
      {Array(5)
        .fill("")
        .map((_, index) => (
          <Skeleton
            key={`skeleton-${index}`}
            height={134}
            width={976}
            sx={{ mb: "24px" }}
          />
        ))}
    </Container>
  )
}
