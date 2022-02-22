import { Components, Theme } from "@mui/material"

export default function DialogTitleTheme(theme: Theme): Components {
  return {
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: theme.typography.h3.fontSize,
        },
      },
    },
  }
}
