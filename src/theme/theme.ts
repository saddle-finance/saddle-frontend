import { createTheme } from "@mui/material"
import palette from "./palette"

export const lightTheme = createTheme({
  palette: palette.lightPalette,
  spacing: 8,
})
export const darkTheme = createTheme({
  palette: palette.darkPalette,
  spacing: 8,
})
