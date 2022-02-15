import { createTheme } from "@mui/material/styles"
import palette from "./palette"
import typography from "./typography"

export const lightTheme = createTheme({
  palette: palette.lightPalette,
  typography: typography,
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 544,
      md: 768,
      lg: 1024,
      xl: 1536,
    },
  },
})
export const darkTheme = createTheme({
  palette: palette.darkPalette,
  typography: typography,
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
})
