import { createTheme } from "@mui/material/styles"
import palette from "./palette"
import typography from "./typography"

export const lightTheme = createTheme({
  palette: palette.lightPalette,
  typography: typography,
  spacing: 8,
})
export const darkTheme = createTheme({
  palette: palette.darkPalette,
  typography: typography,
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
})
