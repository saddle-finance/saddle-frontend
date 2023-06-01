import React, { Suspense } from "react"
import { styled, useTheme } from "@mui/material"

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import DevTool from "../components/DevTool/DevTool"
import { LocalizationProvider } from "@mui/x-date-pickers"
import Pages from "./Pages"
import { ToastContainer } from "react-toastify"
import TopMenu from "../components/TopMenu"
import Version from "../components/Version"
import WrongNetworkModal from "../components/WrongNetworkModal"

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

export default function AppContainer() {
  const theme = useTheme()
  return (
    <>
      <TopMenu />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Suspense fallback={null}>
          <AppWrapper>
            <Pages />
            <Version />
            <ToastContainer
              theme={theme.palette.mode === "dark" ? "dark" : "light"}
              position="top-left"
            />
            <DevTool />
            <WrongNetworkModal />
          </AppWrapper>
        </Suspense>
      </LocalizationProvider>
    </>
  )
}
