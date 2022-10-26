import { Container, Skeleton } from "@mui/material"
import React from "react"

export default function SwapSkeleton() {
  return (
    <Container maxWidth="sm" sx={{ pt: 5, pb: 20 }}>
      <Skeleton width={494} height="306px" />
      <Skeleton width={494} height="236px" sx={{ mt: "24px" }} />
      <Skeleton width={494} height="42px" sx={{ mt: "40px" }} />
    </Container>
  )
}
