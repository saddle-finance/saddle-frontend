import React, { PropsWithChildren } from "react"
import DevTool from "../components/DevTool/DevTool"
import { styled } from "@mui/material"

const AppWrapper = styled("div")(({ theme }) => {
  const darkBackground = "/static/images/dark-bg.svg"
  const lightBackground = "/static/images/light-bg.svg"
  return {
    background:
      theme.palette.mode === "light"
        ? `url(${lightBackground})`
        : `url(${darkBackground})`,
    minHeight: "100vh",
    minWidth: "100vw",
    marginRight: "calc(-1 * (100vw - 100%))",
    backgroundAttachment: "fixed",
    backgroundPosition: "center bottom",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    position: "relative",
  }
})

export default function AppContainer({ children }: PropsWithChildren<unknown>) {
  return (
    <AppWrapper>
      {children}
      <DevTool />
    </AppWrapper>
  )
}
