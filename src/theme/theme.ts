import { createTheme } from "@mui/material"
import palette from "./palette"

export const lightTheme = createTheme({
  palette: palette.lightTheme,
  spacing: 8,
})
export const darkTheme = createTheme({
  palette: palette.darkTheme,
  spacing: 8,
})
