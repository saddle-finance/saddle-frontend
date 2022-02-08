import { Components, Theme } from "@mui/material"

export default function MenuTheme(theme: Theme): Components {
  return {
    MuiMenu: {
      styleOverrides: {
        root: {
          paddingTop: theme.spacing(2),
          paddingBottom: theme.spacing(2),
        },
        list: {
          paddingTop: theme.spacing(2),
          paddingBottom: theme.spacing(2),
        },
      },
    },
  }
}
