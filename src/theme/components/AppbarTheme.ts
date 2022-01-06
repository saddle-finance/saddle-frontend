import { Components, Theme } from "@mui/material"

export default function AppBarTheme(theme: Theme): Components {
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
