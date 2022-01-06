import { Components, Theme } from "@mui/material"

export default function AppBar(theme: Theme): Components {
  console.log("background.default", theme.palette.background.default)
  return {
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderColor: "transparent",
          backgroundColor: theme.palette.background.default,
        },
      },
    },
  }
}
