import React, { PropsWithChildren } from "react"
import DevTool from "../components/DevTool/DevTool"
import { styled } from "@mui/material"

const AppWrapper = styled("div")(({ theme }) => {
  const darkBackground =
    "linear-gradient(180deg, #000000, #070713 10%, #121334 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%), radial-gradient(50% 395.51% at 50% 4.9%, #121334 0%, #000000 100%)"
  const lightBackground =
    "linear-gradient(180deg, #FFFFFF, #FAF3CE 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%), radial-gradient(87.11% 100% at 50% 0%, #FFFFFF 0%, #FDF8DD 100%)"
  return {
    backgroundImage:
      theme.palette.mode === "light" ? lightBackground : darkBackground,
    minHeight: "100vh",
    minWidth: "100vw",
    marginRight: "calc(-1 * (100vw - 100%))",
    backgroundAttachment: "fixed",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
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
