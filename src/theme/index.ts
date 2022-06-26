import { ThemeOptions, createTheme } from "@mui/material/styles"
import palette from "./palette"
import typography from "./typography"

const theme: ThemeOptions = {
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
      xl: 1440,
    },
  },
}
export const lightTheme = createTheme({
  palette: palette.lightPalette,
  ...theme,
})
export const darkTheme = createTheme({
  palette: palette.darkPalette,
  ...theme,
})
