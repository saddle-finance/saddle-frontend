import { AppBar, Toolbar } from "@mui/material"
import React, { PropsWithChildren, ReactElement } from "react"
import MuiContainer from "@mui/material/Container/Container"

export default function Container({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  return (
    <MuiContainer maxWidth="lg">
      <AppBar>
        <Toolbar>appbar</Toolbar>
      </AppBar>
      <Toolbar />
      {children}
    </MuiContainer>
  )
}
