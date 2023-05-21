import { LinearProgress, styled, useTheme } from "@mui/material"
import React, { Suspense } from "react"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import DevTool from "../components/DevTool/DevTool"
import { LocalizationProvider } from "@mui/x-date-pickers"
import Pages from "./Pages"
import { ToastContainer } from "react-toastify"
import TopMenu from "../components/TopMenu"
import Version from "../components/Version"
import WrongNetworkModal from "../components/WrongNetworkModal"
import { useIsFetching } from "@tanstack/react-query"

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
  const isFetching = useIsFetching()
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AppWrapper>
        {!!isFetching && <LinearProgress />}
        <TopMenu />
        <Suspense fallback={null}>
          <Pages />
        </Suspense>
        <Version />
        <ToastContainer
          theme={theme.palette.mode === "dark" ? "dark" : "light"}
          position="top-left"
        />
        <DevTool />
        <WrongNetworkModal />
      </AppWrapper>
    </LocalizationProvider>
  )
}
