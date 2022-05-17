import { Components, Theme } from "@mui/material"

export default function SelectTheme(theme: Theme): Components {
  return {
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: theme.palette.primary.main,
        },
      },
    },
  }
}
