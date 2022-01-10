import { Components, Theme } from "@mui/material"

export default function ButtonTheme(theme: Theme): Components {
  return {
    MuiDialog: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
        paper: {
          borderRadius: 10,
          backgroundColor: theme.palette.background.default,
          backgroundImage: "none",
        },
      },
    },
  }
}
