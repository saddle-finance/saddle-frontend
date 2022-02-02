import { Components, Theme } from "@mui/material"

export default function ListItemButtonTheme(theme: Theme): Components {
  return {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          paddingTop: 0,
          paddingBottom: 0,
          marginLeft: theme.spacing(2),
          marginRight: theme.spacing(2),
        },
      },
    },
  }
}
