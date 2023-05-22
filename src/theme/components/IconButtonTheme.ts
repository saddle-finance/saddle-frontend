import { Components, Theme } from "@mui/material"

export default function IconButtonTheme(theme: Theme): Components {
  return {
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: theme.palette.text.secondary,
        },
      },
    },
  }
}
