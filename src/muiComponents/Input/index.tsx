import React, { ReactElement } from "react"
import { Box } from "@mui/material"

interface Props {
  token: number
}

export default function TokenInput({ token }: Props): ReactElement {
  return (
    <div>
      <Box>token input:{token}</Box>
    </div>
  )
}
