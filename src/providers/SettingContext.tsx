import React, {
  PropsWithChildren,
  ReactElement,
  createContext,
  useEffect,
  useState,
} from "react"
import { darkTheme, lightTheme } from "../theme/theme"
import { CssBaseline } from "@mui/material"
import { ThemeProvider } from "@mui/material"
import useMediaQuery from "@mui/material/useMediaQuery"

export type ThemeMode = "light" | "dark" | "system"
export type SettingsContextProps = {
  themeMode: ThemeMode
  onChangeMode: (themeMode: ThemeMode) => void
}

const initialState: SettingsContextProps = {
  themeMode: "light",
  onChangeMode: () => undefined,
}

const SettingsContext = createContext(initialState)

function SettingsProvider({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  const [mode, setMode] = useState<ThemeMode>("system")
  const prefersDarkMode = (useMediaQuery("(prefers-color-scheme: dark)")
    ? "dark"
    : "light") as ThemeMode

  useEffect(() => {
    const initialMode = (localStorage.getItem("paletteMode") ||
      "system") as ThemeMode
    setMode(initialMode === "system" ? prefersDarkMode : initialMode)
  }, [setMode, prefersDarkMode])

  useEffect(() => {
    const modeValue = mode === "system" ? prefersDarkMode : mode
    if (modeValue === "dark") {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }
  }, [mode, prefersDarkMode])

  const onChangeMode = (mode: ThemeMode) => {
    setMode(mode)
    localStorage.setItem("paletteMode", mode)
  }

  return (
    <SettingsContext.Provider
      value={{
        // Mode
        themeMode: mode,
        onChangeMode,
      }}
    >
      <ThemeProvider theme={mode === "dark" ? darkTheme : lightTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </SettingsContext.Provider>
  )
}

export { SettingsProvider, SettingsContext }
