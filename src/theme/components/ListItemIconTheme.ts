import { Components, Theme } from "@mui/material"

export default function ListItemIconTheme(theme: Theme): Components {
  return {
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: theme.spacing(4),
          color: theme.palette.text.primary,
        },
      },
    },
  }
}
