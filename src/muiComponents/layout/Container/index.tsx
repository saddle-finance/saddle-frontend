import { AppBar, Toolbar } from "@mui/material"
import React, { PropsWithChildren, ReactElement } from "react"
import MuiContainer from "@mui/material/Container/Container"
import TopMenu from "../../../components/TopMenu"

export default function Container({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  return (
    <MuiContainer maxWidth="lg">
      <AppBar elevation={2}>
        <Toolbar>
          <TopMenu />
        </Toolbar>
      </AppBar>
      <Toolbar sx={{ marginBottom: "10px" }} />
      {children}
    </MuiContainer>
  )
}
