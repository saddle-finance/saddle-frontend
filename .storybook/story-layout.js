import React, { useState } from "react"
import { lightTheme, darkTheme } from "../src/theme"
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles"
import { Box, Switch, Typography } from "@mui/material"
import { ThemeProvider } from "@emotion/react"
import componentsOverrides from "../src/theme/components"

export default function StoryLayout({ children }) {
  const muiLightTheme = lightTheme
  muiLightTheme.components = componentsOverrides(muiLightTheme)
  const muiDarkTheme = darkTheme
  muiDarkTheme.components = componentsOverrides(muiDarkTheme)
  const [isLightTheme, setIsLightTheme] = useState(false)
  const currentTheme = isLightTheme ? muiLightTheme : muiDarkTheme

  const handleChange = (event) => {
    setIsLightTheme(event.target.checked)
  }

  return (
    <MUIThemeProvider theme={currentTheme}>
      <ThemeProvider theme={currentTheme}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            minHeight: "100%",
            background: (theme) => theme.palette.background.paper,
          }}
        >
          <Box display="flex" alignItems="center" marginBottom="50px">
            <Box flex={1} />
            <Typography color="primary">Dark</Typography>
            <Switch value={isLightTheme} onChange={handleChange} />
            <Typography color="secondary">Light</Typography>
          </Box>
          <Box>{children}</Box>
        </Box>
      </ThemeProvider>
    </MUIThemeProvider>
  )
}
