import React, { ReactElement } from "react"

import useThemeManager from "../hooks/useThemeManager"

export const ThemeContext = React.createContext<{
  toggleTheme: () => void
  userDarkMode: boolean
}>({
  toggleTheme: () => null,
  userDarkMode: true,
})

export default function ThemeProvider({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const themeManager = useThemeManager()

  return (
    <ThemeContext.Provider value={themeManager}>
      {children}
    </ThemeContext.Provider>
  )
}
