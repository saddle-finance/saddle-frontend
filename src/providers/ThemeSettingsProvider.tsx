import { CssBaseline, responsiveFontSizes } from "@mui/material"
import React, {
  PropsWithChildren,
  ReactElement,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { darkTheme, lightTheme } from "../theme"

import { ThemeProvider } from "@mui/material"
import componentsOverrides from "../theme/components"
import useMediaQuery from "@mui/material/useMediaQuery"

export type ThemeMode = "light" | "dark" | "system"
export type ThemeSettingsContextProps = {
  themeMode: ThemeMode
  onChangeMode: (themeMode: ThemeMode) => void
}

const initialState: ThemeSettingsContextProps = {
  themeMode: "system",
  onChangeMode: () => undefined,
}

const ThemeSettingsContext = createContext(initialState)

function ThemeSettingsProvider({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  const [mode, setMode] = useState<ThemeMode>("system")
  const prefersDarkMode = (
    useMediaQuery("(prefers-color-scheme: dark)") ? "dark" : "light"
  ) as ThemeMode

  useEffect(() => {
    const initialMode: ThemeMode = (localStorage.getItem("paletteMode") ||
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

  const theme =
    mode === "dark"
      ? responsiveFontSizes(darkTheme)
      : responsiveFontSizes(lightTheme)
  theme.components = componentsOverrides(theme)

  return (
    <ThemeSettingsContext.Provider
      value={{
        themeMode: mode,
        onChangeMode,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeSettingsContext.Provider>
  )
}

export { ThemeSettingsProvider, ThemeSettingsContext }

export const useThemeSettings: () => ThemeSettingsContextProps = () =>
  useContext(ThemeSettingsContext)
