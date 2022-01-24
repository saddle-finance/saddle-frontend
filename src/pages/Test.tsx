import { Button } from "@mui/material"
import React from "react"

export default function Test() {
  return (
    <div style={{ backgroundColor: "rgba(0,0,0)", height: "50vh" }}>
      <Button variant="contained" color="primary">
        Contained Primary
      </Button>
      <Button variant="contained" color="secondary">
        Contained Secondary
      </Button>
      <Button variant="contained" color="secondaryLight">
        Contained Secondary light
      </Button>
    </div>
  )
}
