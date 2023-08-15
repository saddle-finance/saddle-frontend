import { Alert, Link, styled, useTheme } from "@mui/material"
import React, { Suspense } from "react"

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
            <Alert severity="error">
              The Saddle DAO voted to wind down the protocol by pausing all
              pools and dissolving the community multisig in{" "}
              <Link href="https://vote.saddle.community/#/proposal/0x271aef6b1d04cf08878b33d304add4827da146dc7b1ca12d802a3922e29ad34b">
                SIP-54
              </Link>
              . Users are advised to withdraw their funds{" "}
              <Link href="https://saddle.exchange/#/pools">here</Link>.
            </Alert>
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
