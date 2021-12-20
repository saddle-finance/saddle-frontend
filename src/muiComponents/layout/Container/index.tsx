import React, { PropsWithChildren, ReactElement } from "react"
import MuiContainer from "@mui/material/Container/Container"
import TopMenu from "../../../components/TopMenu"

export default function Container({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  return (
    <div>
      <TopMenu />
      <MuiContainer maxWidth="lg">{children}</MuiContainer>
    </div>
  )
}
